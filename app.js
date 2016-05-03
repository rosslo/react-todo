import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import Colors from 'material-ui/lib/styles/colors';
import FontIcon from 'material-ui/lib/font-icon';
import IconButton from 'material-ui/lib/icon-button';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Checkbox from 'material-ui/lib/checkbox';
var itemsData = [{"thing":"Studying","done":false},{"thing":"Sleeping","done":true},{"thing":"拯救世界","done":false}];
var TodoApp = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	loadItemsFromServer: function() {
		this.setState({data: itemsData});
	},
	handleItemSubmit: function(newItem) {
		var newItemIndex = itemsData.length,
		    newItemData = {};
		newItemData.thing=newItem;
		newItemData.done=false;
		itemsData.push(newItemData);
		this.loadItemsFromServer();
	},
	componentDidMount: function() {
		this.loadItemsFromServer();
	},
	render: function() {
		var items = this.state.data,
			undoneCount = 0;
		items.map(function(item){
			if(item.done===false){
				undoneCount +=1;
			}
		});
		return (
			<div className="todoApp">
				<TodoHeader undone={undoneCount} />
				<InputField onItemSubmit={this.handleItemSubmit}/>
				<TodoList data={this.state.data} change={this.loadItemsFromServer}/>
				<TodoAction />
			</div>
		);
	}
});
var TodoHeader = React.createClass({
	render: function() {
		return (
			<div className="todoApp-header">
				<h1>My To-Do List</h1>
				<p className="header">Action</p>
				<span>{this.props.date}尚有<span style={{color:"red",fontSize:20,fontWeight:"bold"}}>{" "+this.props.undone+" "}</span>項未完成待辦事項</span>
			</div>
		);
	}
});
var InputField = React.createClass({
	getInitialState: function() {
		return{
			newItem: "",
			errorText: ""
		};
	},
	handleChange: function(e) {
		this.setState({newItem: e.target.value, errorText:""});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		if(this.state.newItem!==""){
			this.props.onItemSubmit(this.state.newItem);
			this.setState({newItem:""});
		}else{
			this.setState({errorText:"This field is required"});
		}

	},
	render: function() {
		return (
			<form className="todoApp-form" onSubmit={this.handleSubmit}>
				<p className="header">add</p>
				<TextField className="add-input" hintText="say something..." floatingLabelText="Add a to-do item" errorText={this.state.errorText} value={this.state.newItem} onChange={this.handleChange} />
				<span style={{float:"right", position:"relative", top:25}}>
					<RaisedButton style={{top:50}} label="Add" type="submit" className="submit-btn"/>
				</span>
			</form>
		);
	}
})
var TodoList = React.createClass({
	handleChange: function(index,e,newstate) {
		itemsData[index].done=newstate;
		this.props.change();
	},
	handleDelete: function() {
		this.props.change();
	},
	render: function() {
		var	items = this.props.data,
			undone=[],
			done=[];
		items.map(function(item, index){
			var todoItem = <TodoItem key={"Item."+index} ref={"Item."+index} done={item.done} index={index} change={this.handleChange}deleteItem={this.handleDelete}>{item.thing}</TodoItem>;
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
var TodoItem = React.createClass({
	getInitialState: function() {
		return{
			text: this.props.children,
			edit: false
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
	handleEndEdit: function() {
		var index = this.props.index;
		this.setState({edit:!this.state.edit});
		itemsData[index].thing=this.state.text;
	},
	handleDeleteClick: function() {
		var index = this.props.index;;
		delete itemsData[index];
		this.props.deleteItem();
	},
	render: function() {
		var item,
			itemSpan = <span className="item-content" onClick={this.handleEditClick}>{this.state.text}</span>,
			itemInput = <input className="edit-input" type="text" value={this.state.text} onBlur={this.handleEndEdit}
						onChange={this.handleTextChange} autoFocus={true}/>,
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
					<IconButton iconClassName="fa fa-pencil" onClick={this.handleEditClick} />
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
				<span className="action-btn">
					<RaisedButton label="Date" type="submit" className="submit-btn"
						icon={<FontIcon className="fa fa-clock-o"/>} />
				</span>
				<span className="action-btn">
					<RaisedButton label="Save" type="submit" className="submit-btn"
						icon={<FontIcon className="fa fa-floppy-o"/>} />
				</span>
				<span className="action-btn">
					<RaisedButton label="Delete" type="submit" className="submit-btn" backgroundColor={Colors.red600}
						icon={<FontIcon style={{fontSize:5}} className="fa fa-trash-o"/>} />
				</span>
			</div>
		);
	}
});
ReactDOM.render(
	<TodoApp />,
	document.getElementById('app')
);