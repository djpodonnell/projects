import React,{Component,useRef} from 'react';
import './App.css';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { TreeView } from '@material-ui/lab';
import TreeItem from '@material-ui/lab/TreeItem';

class App extends React.Component {
  constructor(props) {
    super(props);
	
	this.state = {
      data: '',
	  dataIsReturned : false,
	  currentPath: '',
	  currentKey: ''
    };
  };
  
  componentDidMount(){
	  this.getData();
  }
	
  getData=()=>{
	if(this.state.data && this.state.data.length>0) 
	  return;
  
    var self = this;
	  
    fetch('./swagger.json'
    ,{
      headers : { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }
    }
    )
     .then(function(response){
		return response.json();
      })
      .then(function(parseJson) {
        var stringJSON = JSON.stringify(parseJson);
		self.setState({data: parseJson});
		self.setState({dataIsReturned : true});
      });
  };
  
  handleSelect(isPath, currentNode,key) {
	  if(!isPath || typeof(key) === 'undefined' || this.state.currentKey.length > 0) {
		 return; 
	  }
	  this.setState({currentPath: currentNode});
	  this.setState({currentKey: key});
  }
  
  //get tree structure for json components.
  getInnerKeys(value, isPath) {
	  var parsedJSON = [];
	  if(typeof(value) !== 'object') {
		  return;
	  }
	  var objectCount = Object.keys(value).length;
	  for (var i=0;i<objectCount;i++) {
		const key = Object.keys(value)[i];
		const innerValue = typeof(value[key]) === 'object' ? '': ":"+value[key];
		//if a component has children just put a '+' in front of it so its clear it can open a child list
	    const fullString = innerValue.length > 0 ? key+innerValue : "+ "+key;
		
		parsedJSON.push(<TreeItem nodeId={key+i} label={
        <ListItem onClick={() => { this.handleSelect(isPath,value[key],key)}} button component="a" href="#">
          <ListItemText primary={fullString} />
        </ListItem>}>{this.getInnerKeys(value[key], key === "paths")}</TreeItem>);
	  }
      return parsedJSON;
  }
  
  resetView() {
	this.setState({currentPath: ''});
	this.setState({currentKey: ''});
  }
  
  getTopObject(value) {
	  var parsedJSON = [];
	  var key = this.state.currentKey;
	  var fullString = key+": ";
	  fullString += this.getInnerText(value);
	
	  parsedJSON.push(<p>{fullString}</p>);
      return parsedJSON;
  }
  
  getInnerText(value) {
	  var parsedJSON = "";
	  
	  var objectCount = Object.keys(value).length;
	  for (var i=0;i<objectCount;i++) {
		var key = Object.keys(value)[i];
		var innerValue = typeof(value[key]) === 'object' ? '': ":"+value[key];
		if(innerValue.length > 1 && objectCount > 1) {
			innerValue = key+innerValue;
		}
		var shownText = "";
		if(innerValue.length === 0) {
			var innerText = this.getInnerText(value[key]);
			if(key.toString() === i.toString()) {
				shownText = innerText;
			} else {
			  key = (innerText.lastIndexOf(":", 0) === 0) ? key : key+":";
			  shownText = key+innerText;
			}
		}
	    var fullString = innerValue.length > 0 ? innerValue : shownText;
		if(i < objectCount-1) {
			fullString+=", ";
		}
		
		parsedJSON+= fullString;
	  }
	  if(objectCount > 1) {  
	    parsedJSON = "{"+parsedJSON+"}";
	  }
      return parsedJSON;
  }
  
render() {	
  return (
    this.state.dataIsReturned ? 
	typeof(this.state.currentPath) === 'object' ? 
	<div>
	<button onClick={() => { this.resetView()}}>Return to full view</button>
	{this.getTopObject(this.state.currentPath)}
	</div>
	:
	<div><TreeView>
	{this.getInnerKeys(this.state.data)}
    </TreeView>	
    </div> : <p> Loading </p>
  )
};
}

export default App;