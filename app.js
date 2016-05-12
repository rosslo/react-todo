import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import FontIcon from 'material-ui/lib/font-icon';
import IconButton from 'material-ui/lib/icon-button';
import RaisedButton from 'material-ui/lib/raised-button';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import Card from 'material-ui/lib/card/card';
import CardActions from 'material-ui/lib/card/card-actions';
import CardText from 'material-ui/lib/card/card-text';
var itemsData;
const TodoApp = React.createClass({
	getInitialState: function() {
		return {
			data: []
		};
	},
	callback: function(data) {
		var reverseData = data.slice(); //為了讓reverse後不改變itemsDate
		this.setState({data:reverseData.reverse()});
		itemsData = reverseData;
	},
	handleReRender: function() {
		itemsData.sort(function(a,b) {return (b.id - a.id);} ); //照id由大到小排列
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
		if(cardIndex===itemsData.length){
			let id=itemsData[0].id+1; //最後一個card的id+1
			newItem.id=id;
			itemsData[cardIndex]=newItem;
		}else{
			var newItemIndex = itemsData[cardIndex].itemData,
			    newItemData = new Object();
			newItemData.thing=newItem;
			newItemData.done=false;
			newItemIndex.push(newItemData);
		}
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
					<h1>My To-Do Board</h1>
					{cards}
					<TodoCreate cardIndex={this.state.data.length} addSubmit={this.handleItemSubmit} />
			</div>
		);
	}
});
const TodoCard = React.createClass({
	getInitialState: function() {
		return{
			open: false,
			cardEvent: this.handleOpen
		}
	},
	handleOpen: function() {
		this.setState({open: true});
	},
	handleClose: function() {
		this.setState({open: false});
	},
	handleRemoveCard: function() {
		delete itemsData[this.props.cardIndex];
		this.props.saveChange();
	},
	removeCardEvent: function() {
		this.setState({cardEvent:""});
	},
	resetCardEvent: function() {
		this.setState({cardEvent:this.handleOpen});
	},
	render: function() {
		let undoneCount = this.props.undoneCount;
		const actions = [<FlatButton label="Ok" primary={true} keyboardFocused={true} onTouchTap={this.handleClose}/>];
		var	dialogTitle = this.props.data.title ? <h1>{this.props.title}</h1>: <InputField />;
		return(
			<div>
			<Card style={{cursor:"pointer",marginBottom:20,boxShadow:"rgba(0, 0, 0, 0.25) 0px 1px 6px, rgba(0, 0, 0, 0.25) 0px 1px 4px"}} onTouchTap={this.state.cardEvent}>
			    <CardText style={{position:"relative"}}>
			    	 <p className="header" style={{fontSize: "1.3em"}}>{this.props.title}</p>
					 <IconButton iconClassName="fa fa-trash-o" style={{position:"absolute",top:0,right:0}}
					 tooltip="delete the card" touch={true} tooltipPosition="bottom-left" onClick={this.handleRemoveCard} onMouseOver={this.removeCardEvent} onMouseOut={this.resetCardEvent} onTouchStart={this.removeCardEvent} onTouchEnd={this.resetCardEvent}/>
			    	<TodoHeader showTitle={false} undone={undoneCount} />
			    </CardText>
			</Card>
	        <Dialog actions={actions} open={this.state.open} autoDetectWindowHeight={true} onRequestClose={this.handleClose} autoScrollBodyContent={true} contentClassName="dialog-content">
				<TodoHeader title={this.props.title} undone={undoneCount} cardIndex={this.props.cardIndex} showTitle={true} saveTitle={this.props.saveChange}/>
				<InputField cardIndex={this.props.cardIndex} addSubmit={this.props.addSubmit} />
				<TodoList data={this.props.data} cardIndex={this.props.cardIndex} change={this.props.saveChange} renderList={true}/>
			</Dialog>
			</div>
		);
	}
});
const TodoCreate = React.createClass({  //新增todo卡
	getInitialState: function() {
		return{
			open: false,
			newItemData: {"id":9,"title":"","itemData":[]},
			titleText: "",
			undone: 0,
			renderList: false
		}
	},
	handleOpen: function() {
		this.setState({open: true});
	},
	handleClose: function() {  //clear
		this.setState({open: false,undone: 0,titleText:"",newItemData:{"id":9,"title":"","itemData":[]}});
	},
	handleAddItem: function(cardIndex,newItem,isTitle) {
		var itemObject = this.state.newItemData, //用於儲存要創建card時傳遞的全部資料
			itemDataArray = itemObject.itemData,
			newObject = new Object(), //每一個itemData
			undone = 0;
		if(isTitle){ //傳來的值是否是設定title
			itemObject.title=newItem;
			this.setState({titleText:newItem});
		}else{
			 //newItemData初始設定的值是否已被修改
				newObject.thing=newItem;
				newObject.done=false;
				itemDataArray.push(newObject);
				undone = itemDataArray.length;
		}
		if(undone>0){this.setState({renderList:true});}
		this.setState({newItemData:itemObject,undone:undone});
	},
	handleItemChange: function(itemIndex,type) { //type 執行的事件類型:delete、check、edit
		var itemObject = this.state.newItemData,
			itemDataArray = itemObject.itemData,
			undone = 0;
		switch(type){
			case "delete":
				delete itemDataArray[itemIndex];
				break;
			case "check":
				let itemDone = itemDataArray[itemIndex].done
				itemDataArray[itemIndex].done=!itemDone;
				break;
			default:
				let newThing = type; //因為edit需要用type傳遞修改的值，所以放在default;
				itemDataArray[itemIndex].thing=newThing;
		}
		undone = itemDataArray.length;
		this.setState({newItemData:itemObject,undone:undone});
	},
	handleSaveCard: function() {
		var cardIndex = this.props.cardIndex,
			newItemObject = this.state.newItemData; //傳遞新卡的內容去儲存
		this.props.addSubmit(cardIndex,newItemObject);
		this.handleClose();
	},
	render: function() {
		var cardIndex = this.props.cardIndex;
		const actions = [<FlatButton label="Cancel" secondary={true} onTouchTap={this.handleClose}/>,<FlatButton label="Save" primary={true} keyboardFocused={true} onTouchTap={this.handleSaveCard}/>];
		return (
			<div>
				<FlatButton label="Add a card..." labelStyle={{textTransform: "none",fontSize:20}} onTouchTap={this.handleOpen}/>
		        <Dialog actions={actions} open={this.state.open} contentClassName="dialog-content"
		          autoDetectWindowHeight={true} onRequestClose={this.handleClose} autoScrollBodyContent={true}>
					<TodoHeader cardIndex={null} undone={this.state.undone} showTitle={true} saveTitle={this.handleAddItem}  title={this.state.titleText}/>
					<InputField cardIndex={cardIndex} addSubmit={this.handleAddItem} />
					<TodoList data={this.state.newItemData} renderList={this.state.renderList} change={this.handleItemChange} />
				</Dialog>
			</div>
		);
	}
});
const TodoHeader = React.createClass({
	getInitialState: function() {
		return{
			edit: false,
			titleText: this.props.title
		}
	},
	handleTitleChange: function(e) {
		this.setState({titleText:e.target.value});
	},
	handleEditClick: function() {
		this.setState({edit: true});
	},
	handleEditKeydown: function(e) {
		if(e.keyCode == 13){
			this.handleSaveChange();
		}
	},
	handleSaveChange: function() {
		if(this.props.cardIndex!==null){
			itemsData[this.props.cardIndex].title=this.state.titleText; //修改已有卡的title
			this.props.saveTitle();
		}else{
			this.props.saveTitle(null,this.state.titleText,true); //創建新卡的title
		}
		this.setState({edit: false});
	},
	render: function() {
		var undoneCount = this.props.undone ? this.props.undone: 0;
		var title;
		if(this.props.showTitle){
			if(this.props.title && !this.state.edit){
				title = <span style={{fontSize:24,fontWeight:"bold"}} onClick={this.handleEditClick}>{this.state.titleText}</span>;
			}else{
				title = <TextField className="title-input" floatingLabelText="Set the title" value={this.state.titleText} onChange={this.handleTitleChange} onBlur={this.handleSaveChange} onKeyDown={this.handleEditKeydown} autoFocus={true}/>;
			}
		}
		return (
			<div className="todoApp-header">
				{title}
				<span className="text-box">尚有<span style={{color:"red",fontSize:20,fontWeight:"bold"}}>{" "+undoneCount+" "}</span>項未完成待辦事項</span>
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
		if(this.state.newItem.trim()!==""){
			this.props.addSubmit(this.props.cardIndex,this.state.newItem);  //todoApp.handleItemSubmit();
			this.setState({newItem:""});
		}else{
			this.setState({errorText:"This field is required"});
			this.refs.addInput.focus();
		}
	},
	render: function() {
		return (
			<form className="todoApp-form" onSubmit={this.handleSubmit}>
				<p className="header">Add&nbsp;&nbsp;task</p>
				<TextField className="add-input" ref="addInput" hintText="say something..." floatingLabelText="Add a to-do item" errorText={this.state.errorText} value={this.state.newItem} onChange={this.handleChange} onBlur={this.handleErrorBlur}/>
				<span className="add-btn">
					<RaisedButton style={{top:50}} label="Add" type="submit" className="submit-btn"/>
				</span>
			</form>
		);
	}
})
const TodoList = React.createClass({
	render: function() {
		if(this.props.renderList){
			var	items = this.props.data.itemData,
				cardIndex = this.props.cardIndex,
				undone=[],
				done=[];
			items.map(function(item, index){
				var todoItem = <TodoItem key={"Item."+index} ref={"Item."+index} done={item.done} cardIndex={cardIndex} index={index} change={this.props.change}>{item.thing}</TodoItem>;
				if(item.done){
					done.push(todoItem);
				}else{
					undone.push(todoItem);
				}
			}.bind(this));
		}
		return (
			<div className="todoApp-list">
				<p className="header">todo&nbsp;&nbsp;list</p>
				<ul className="undone-list">
					{undone}
				</ul>
				<p className="header">completed</p>
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
			iconEvent: this.handleEditClick, //edit icon之按鈕的事件
			blurEvent: this.saveItemEditedText //itemInput的事件
		};
	},
	handleEditClick: function() {
		this.setState({edit: true,iconEvent: this.saveItemEditedText});
	},
	handleTextChange: function(e) {
		this.setState({text:e.target.value});
	},
	removeBlur: function() {  //避免在itemInput edit下click時，editIcon按鈕會先觸發blur才click
		this.setState({blurEvent:""});
	},
	resetBlur: function() {  //滑鼠移開=點擊動作解除，回復blur事件
		this.setState({blurEvent:this.saveItemEditedText});
	},
	handleEditKeydown: function(e) {
		if(e.keyCode == 13){
			this.saveItemEditedText();
		}
	},
	handleCheckChange: function(e) {
		var index = this.props.index;
		if(this.props.cardIndex!==undefined){
			itemsData[this.props.cardIndex].itemData[index].done=e.target.checked;
			this.props.change();
		}else{
			this.props.change(index,"check");
		}
	},
	handleDeleteClick: function() {
		var index = this.props.index;
		if(this.props.cardIndex!==undefined){
			delete itemsData[this.props.cardIndex].itemData[index];
			this.props.change();
		}else{
			this.props.change(index,"delete");
		}
	},
	saveItemEditedText: function() {
		var index = this.props.index;
		this.setState({edit:false, iconEvent: this.handleEditClick});
		if(this.props.cardIndex!==undefined){
			itemsData[this.props.cardIndex].itemData[index].thing=this.state.text;
		}else{
			this.props.change(index,this.state.text);
		}
	},
	render: function() {
		var item,
			editIcon = this.state.edit ? "fa fa-check": "fa fa-pencil", //edit icon之按鈕的類別
			itemSpan = <span className="item-content" onClick={this.handleEditClick}>{this.state.text}</span>,
			itemInput = <textarea className="edit-input" type="text" value={this.state.text} onBlur={this.state.blurEvent}
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
					<IconButton iconClassName={editIcon} onClick={this.state.iconEvent}
						onMouseOver={this.removeBlur} onMouseOut={this.resetBlur}/>
					<IconButton iconClassName="fa fa-trash-o" onClick={this.handleDeleteClick} />
				</span>
				<div className="clearfix"></div>
			</li>
		);
	}
});
ReactDOM.render(
	<TodoApp />,
	document.getElementById('app')
);