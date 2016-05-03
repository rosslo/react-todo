import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import FontIcon from 'material-ui/lib/font-icon';
import IconButton from 'material-ui/lib/icon-button';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Checkbox from 'material-ui/lib/checkbox';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardHeader from 'material-ui/lib/card/card-header';
import CardText from 'material-ui/lib/card/card-text';
//var itemsData = [{"thing":"Studying","done":false},{"thing":"Sleeping","done":true},{"thing":"拯救世界","done":false}];
var itemsData;
const TodoApp = React.createClass({
	getInitialState: function() {
		return {
			data: []
		};
	},
	callback: function(data) {
		this.setState({data:data});
		itemsData=data;
	},
	handleReRender: function() {
		this.setState({data:itemsData});
	},
	loadItemsFromServer: function(url,callback) {
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    var data = JSON.parse(request.responseText);
		    callback(data);
		  } else {
		    console.log('error');
		  }
		};
		request.send();
	},
	handleItemSubmit: function(cardIndex,newItem) {
		var newItemIndex = itemsData[cardIndex].itemData,
		    newItemData = {};
		newItemData.thing=newItem;
		newItemData.done=false;
		newItemIndex.push(newItemData);
		this.handleReRender();
	},
	componentDidMount: function() {
		this.loadItemsFromServer('todo.json',this.callback);
	},
	render: function() {
		var items = this.state.data,
			undoneCount = 0,
			cards = items.map(function(item,index){
						let undoneCount = 0;
						item.itemData.map(function(data){
							if(!data.done){
								undoneCount +=1;
							}
						});
						return <TodoCard key={"Card"+index} title={item.title} cardIndex={index} data={this.state.data[index]} undoneCount={undoneCount} saveChange={this.handleReRender} addSubmit={this.handleItemSubmit}/>;
					}.bind(this));
		return (
			<div className="todoApp">
					<h1>My To-Do List</h1>
					{cards}
			</div>
		);
	}
});
const TodoCard = React.createClass({
	getInitialState: function() {
		return{
			open: false
		}
	},
	handleOpen: function() {
		this.setState({open: true});
	},
	handleClose: function() {
		this.setState({open: false});
	},
	render: function() {
		let undoneCount = this.props.undoneCount;
		const actions = [<FlatButton label="Cancel" secondary={true} onTouchTap={this.handleClose}/>,
			<FlatButton label="Ok" primary={true} keyboardFocused={true} onTouchTap={this.handleClose}/>];
		return(
			<div>
			<Card style={{cursor:"pointer",marginBottom:20,boxShadow:"rgba(0, 0, 0, 0.25) 0px 1px 6px, rgba(0, 0, 0, 0.25) 0px 1px 4px"}} onTouchTap={this.handleOpen}>
			    <CardText>
			    	<p className="header">{this.props.title}</p>
			    	<TodoHeader undone={undoneCount} showInDialog={false}/>
			    </CardText>
			</Card>
	        <Dialog title={this.props.title} actions={actions} open={this.state.open}
	          autoDetectWindowHeight={true} onRequestClose={this.handleClose} autoScrollBodyContent={true}>
				<TodoHeader date={this.props.data.date} undone={undoneCount} cardIndex={this.props.cardIndex} showInDialog={true} />
				<InputField cardIndex={this.props.cardIndex} addSubmit={this.props.addSubmit} />
				<TodoList data={this.props.data} cardIndex={this.props.cardIndex} change={this.props.saveChange}/>
				<TodoAction />
			</Dialog>
			</div>
		);
	}
});
const TodoHeader = React.createClass({
	getInitialState: function() {
		return{
			date: this.props.date
		}
	},
	handleDateClick: function() {
		this.refs.datePicker.focus();
	},
	handleDateChange: function(e,date) {
		this.setState({date:date});
		itemsData[this.props.cardIndex].date=date;
	},
	formatDate: function(date) {
		var day=date.getDate(),
			weekday=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
			month=["January","February","March","April","May","June","July","August","September","October","November","December"];
		if(day<10){day='0'+day;}
		return weekday[date.getDay()]+" "+month[date.getMonth()]+" "+day+" "+date.getFullYear();
	},
	render: function() {
		//showInDialog用來讓顯示在card時不會出現可點擊按鈕
		var datePicker = this.props.showInDialog ? <DatePicker style={{float:"left"}} hintText="Set the date for this card" ref='datePicker' value={this.state.date} formatDate={this.formatDate} onChange={this.handleDateChange}/>
			: null ;
			var dateBtn = this.props.showInDialog ? <RaisedButton style={{float:"right"}} label="Date" type="submit"
			className="submit-btn" icon={<FontIcon className="fa fa-clock-o"/>} onClick={this.handleDateClick}/> : null ;
		return (
			<div className="todoApp-header">
				{datePicker}
				{dateBtn}
				<span className="text-box">尚有<span style={{color:"red",fontSize:20,fontWeight:"bold"}}>{" "+this.props.undone+" "}</span>項未完成待辦事項</span>
			</div>
		);
	}
});
const InputField = React.createClass({
	getInitialState: function() {
		return{
			newItem: "",
			errorText: ""
		};
	},
	handleChange: function(e) {
		this.setState({newItem: e.target.value, errorText:""});
	},
	handleErrorBlur: function() {
		if(this.state.errorText!==""){
			this.setState({errorText:""});
		}
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(this.state.newItem!==""){
			this.props.addSubmit(this.props.cardIndex,this.state.newItem);
			this.setState({newItem:""});
		}else{
			this.setState({errorText:"This field is required"});
			this.refs.addInput.focus();
		}
	},
	render: function() {
		return (
			<form className="todoApp-form" onSubmit={this.handleSubmit}>
				<p className="header">Add</p>
				<TextField ref="addInput" style={{float:"left",marginTop:-15}} hintText="say something..." floatingLabelText="Add a to-do item" errorText={this.state.errorText} value={this.state.newItem} onChange={this.handleChange} onBlur={this.handleErrorBlur}/>
				<span style={{float:"right", position:"relative", top:10}}>
					<RaisedButton style={{top:50}} label="Add" type="submit" className="submit-btn"/>
				</span>
			</form>
		);
	}
})
const TodoList = React.createClass({
	handleChange: function(index,e,newstate) {
		itemsData[this.props.cardIndex].itemData[index].done=newstate;
		this.props.change();
	},
	handleDelete: function() {
		this.props.change();
	},
	render: function() {
		var	items = this.props.data.itemData,
			cardIndex = this.props.cardIndex,
			undone=[],
			done=[];
		items.map(function(item, index){
			var todoItem = <TodoItem key={"Item."+index} ref={"Item."+index} done={item.done} cardIndex={cardIndex} index={index} change={this.handleChange} deleteItem={this.handleDelete}>{item.thing}</TodoItem>;
			if(item.done){
				done.push(todoItem);
			}else{
				undone.push(todoItem);
			}
		}.bind(this));
		return (
			<div className="todoApp-list">
				<p className="header">todo</p>
				<ul className="undone-list">
					{undone}
				</ul>
				<p className="header">done</p>
				<ul className="done-list">
					{done}
				</ul>
			</div>
		);
	}
});
const TodoItem = React.createClass({
	getInitialState: function() {
		return{
			text: this.props.children,
			edit: false,
			blurEvent: this.handleEditBlur //itemInput的事件
		};
	},
	handleCheckChange: function(e) {
		var index = this.props.index;
		this.props.change(index,this,e.target.checked);
	},
	handleEditClick: function() {
		this.setState({edit:!this.state.edit});
	},
	handleTextChange: function(e) {
		this.setState({text:e.target.value});
	},
	handleEditBlur: function(e) {
		this.saveItemEditedText();
	},
	removeBlur: function() {  //避免在itemInput edit下click時，editIcon按鈕會先觸發blur才click
		this.setState({blurEvent:""});
	},
	resetBlur: function() {  //滑鼠移開=點擊動作解除，回復blur事件
		this.setState({blurEvent:this.handleEditBlur});
	},
	handleEditKeydown: function(e) {
		if(e.keyCode == 13){
			this.saveItemEditedText();
		}
	},
	handleDeleteClick: function() {
		var index = this.props.index;;
		delete itemsData[this.props.cardIndex].itemData[index];
		this.props.deleteItem();
	},
	saveItemEditedText: function() {
		var index = this.props.index;
		this.setState({edit:false});
		itemsData[this.props.cardIndex].itemData[index].thing=this.state.text;
	},
	render: function() {
		var item,
			editIcon = this.state.edit ? "fa fa-check": "fa fa-pencil",
			itemSpan = <span className="item-content" onClick={this.handleEditClick}>{this.state.text}</span>,
			itemInput = <input className="edit-input" type="text" value={this.state.text} onBlur={this.state.blurEvent}
						onChange={this.handleTextChange} onKeyDown={this.handleEditKeydown} autoFocus={true}/>,
			style = {backgroundColor:"#000"};
		item = this.state.edit ? itemInput: itemSpan;
		return (
			<li className="todoApp-item">
				<span className="input-group">
					<input className="item-checkbox" type="checkbox" onChange={this.handleCheckChange}
					checked={this.props.done?"checked":""}/>
					{item}
				</span>
				<span className="iconBtn-group">
					<IconButton iconClassName={editIcon} onClick={this.handleEditClick}
						onMouseOver={this.removeBlur} onMouseOut={this.resetBlur}/>
					<IconButton iconClassName="fa fa-trash-o" onClick={this.handleDeleteClick} />
				</span>
			</li>
		);
	}
});
const TodoAction = React.createClass({
	render: function() {
		return(
			<div className="todoApp-action">
				<p className="header">action</p>
				<span style={{float:"right"}}>
					<RaisedButton label="Save" type="submit" className="submit-btn" style={{marginRight:20}}
					icon={<FontIcon className="fa fa-floppy-o"/>} />
					<RaisedButton label="Delete" type="submit" className="submit-btn"
					 icon={<FontIcon className="fa fa-trash-o"/>} />
				</span>
			</div>
		);
	}
});
ReactDOM.render(
	<TodoApp />,
	document.getElementById('app')
);