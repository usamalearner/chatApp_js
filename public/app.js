let currentUserKey ='';
let chatKey = '';
let friendId = '';
document.addEventListener('keydown',(key)=>{
    if(key.which===13){
        sendMsg();
    }
})

let startChat = (friendKey,friendName,friendPic)=>{
    let friendList = {
        friendId : friendKey,
        userId : currentUserKey
    }
    friendId = friendKey;
    let db = firebase.database().ref('friendList')
    var flag = false;
    db.on('value',(friends)=>{
        friends.forEach((data)=>{
            var user = data.val()
            if((user.friendId === friendList.friendId && user.userId === friendList.userId) || (user.friendId === friendList.userId && user.userId === friendList.friendId)){
                flag = true;
                chatKey = data.key;
            }
        })
        if(flag=== false){

  chatKey =  firebase.database().ref('friendList').push(friendList,(error)=>{
        if(error) alert (error)
        else{
            document.getElementById('seconddiv').removeAttribute('style')
            document.getElementById('firstdiv').setAttribute('style','display:none');
            hideChatlist();
        }
    }).getKey();
        }
        else{
            document.getElementById('seconddiv').removeAttribute('style')
            document.getElementById('firstdiv').setAttribute('style','display:none');
            hideChatlist();
        }
        // display friendname and pic
      
        document.getElementById('divChatname').innerHTML= friendName;
        document.getElementById('imgChat').src= friendPic;

        document.getElementById('messages').innerHTML = '';

        
        document.getElementById('txtMsg').value = '';
        document.getElementById('txtMsg').focus()

        // disply chat msgs
        loadChatMsgs(chatKey,friendPic);

    })
   
  
}

let  loadChatMsgs = (chatKey,friendPic)=>{
    var db = firebase.database().ref('chatMsgs').child(chatKey)
    db.on('value',(chats)=>{
        var messageDisplay = '';
        chats.forEach((data)=>{
            var chat = data.val()
            var dateTime = chat.dateTime.split(",")
            if(chat.userId !== currentUserKey){
                messageDisplay += `   <div class="row">
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${friendPic}"  class="chat-pic" alt="">
                </div>
                <div class="col-7 col-md-7 col-sm-7">
                    <p class="recieve">${chat.msg}
                    <span class="time" title="${dateTime[0]}">${dateTime[1]}</span></p>
                </div>
                
            </div>`
            }
            else{
                messageDisplay += `  <div class="row justify-content-end">
                           
                <div class="col-7 col-md-7 col-sm-7 ">
                    <p class="sent float-right">
                    ${chat.msg}
                        <span class="time" title="${dateTime[0]}">${dateTime[1]}</span></p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img src='${firebase.auth().currentUser.photoURL}'  class="chat-pic" alt="">
                </div>
                
            </div>`;
            }

     


        });
        document.getElementById('messages').innerHTML = messageDisplay;


        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);

    });
}

let showChatlist =()=>{
    document.getElementById('side1').classList.remove('d-none','d-md-block');
    document.getElementById('side2').classList.add('d-none')
}
let hideChatlist =()=>{
    document.getElementById('side1').classList.add('d-none','d-md-block');
    document.getElementById('side2').classList.remove('d-none')
}

let loadChatlist =()=>{
    var db = firebase.database().ref('friendList');
    db.on('value',(lists)=>{
        document.getElementById('listChat').innerHTML = `  <li class="list-group-item" style="background-color: #f8f8f8;">
        <input type="text" placeholder="Search or new Chat" class="form-control form-rounded">
    </li>`
        lists.forEach((data)=>{
            var list = data.val()
            var friendKey = '';
            if(list.friendId === currentUserKey){
                friendKey = list.userId;

            }
            else if (list.userId === currentUserKey){
                friendKey = list.friendId;
            }
            if(friendKey !== ""){
                firebase.database().ref('users').child(friendKey).on('value',(data)=>{
                    var user = data.val()
                    document.getElementById('listChat').innerHTML += ` <li class="list-group-item list-group-item-action"  onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                      <div class="col-md-2">
                          <img src="${user.photoURL}" class="fpic" alt="">
                      </div>
                      <div class="col-md-10" style="cursor: pointer;">
                          <div class="name">${user.name}</div>
                          <div class="under-name">This is some message</div>
                      </div>
                    </div>
                </li>`; 
                })
            }
       
        })
    })
}


let populateFriendlist=()=>{
    document.getElementById('friendlist').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem;"></span>
                                                        </div>`
       let db = firebase.database().ref('users');
        let list = ``;
        db.on('value',(users)=>{
            if(users.hasChildren()){
               list = ` <li class="list-group-item" style="background-color: #f8f8f8;">
                <input type="text" placeholder="Search or new Chat" class="form-control form-rounded">
            </li>`;

            }
            users.forEach((data)=>{
                let user = data.val()
                if(user.email !== firebase.auth().currentUser.email){
                    list += `                        <li class="list-group-item list-group-item-action" data-dismiss="modal"  onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                      <div class="col-md-2">
                          <img src=${user.photoURL} class="fpic" alt="">
                      </div>
                      <div class="col-md-10" style="cursor: pointer;">
                          <div class="name">${user.name}</div>
                      </div>
                    </div>
                </li>`
                }
              
              
            })
            document.getElementById('friendlist').innerHTML = list;
        })


}


  

let sendMsg = ()=>{
    let chatMsg = {
        userId : currentUserKey,
        msg : document.getElementById('txtMsg').value,
        dateTime : new Date().toLocaleString()

    }
    firebase.database().ref('chatMsgs').child(chatKey).push(chatMsg,(error)=>{
        if(error) alert(error)
        else{
//             let message = `  <div class="row justify-content-end">
                           
//             <div class="col-7 col-md-7 col-sm-7 ">
//                 <p class="sent float-right">
//                 ${document.getElementById('txtMsg').value}
//                     <span class="time">1:28 PM</span></p>
//             </div>
//             <div class="col-2 col-sm-1 col-md-1">
//                 <img src='${firebase.auth().currentUser.photoURL}'  class="chat-pic" alt="">
//             </div>
            
//         </div>`
// document.getElementById('messages').innerHTML += message;
document.getElementById('txtMsg').value = '';
document.getElementById('txtMsg').focus();

// document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);
        }
    })
    
}

let loging = ()=>{
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        
        // ...
        // console.log(user)
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorMessage)
      });
}
let loginf =()=>{
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        
      });
}
let signOut = ()=>{

    firebase.auth().signOut().then(function() {
       console.log("successful")
      }).catch(function(error) {
        // An error happened.
      });
      
}
let onFirebaseStateChanged =()=>{
    firebase.auth().onAuthStateChanged(onStateChanged);
}
let onStateChanged = (user)=>{
    if(user){
        // alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);
        var userProfile = {
            email:'',
            name:'',
            photoURL:''
        }
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;

        let db = firebase.database().ref('users');
        let flag = false;
        db.on('value',(users)=>{
            users.forEach((data)=>{
                let user = data.val()
                if(user.email === userProfile.email){
                    currentUserKey = data.key;
                    flag = true;

                }
            })
            if(flag === false){
                firebase.database().ref('users').push(userProfile,callback)

            }
            else{
                document.getElementById("profilepic").src = firebase.auth().currentUser.photoURL;
                document.getElementById("profilepic").title = firebase.auth().currentUser.displayName;
               
                document.getElementById("signIn").style = 'display:none' ;
                document.getElementById("signOut").style = '';
            }
            document.getElementById('disableNewchat').classList.remove('disabled')
            loadChatlist()
        })
       
}
 else{
    document.getElementById("profilepic").src = 'ppic.png'
    document.getElementById("profilepic").title = '';

    document.getElementById("signIn").style = '' ;
    document.getElementById("signOut").style = 'display:none';

    document.getElementById('disableNewchat').classList.add('disabled')

   
}

}
let callback =(error)=>{
    if(error){
        alert(error)
    }
    else{
        document.getElementById("profilepic").src = firebase.auth().currentUser.photoURL;
        document.getElementById("profilepic").title = firebase.auth().currentUser.displayName;
       
        document.getElementById("signIn").style = 'display:none' ;
        document.getElementById("signOut").style = '';
    }
}

onFirebaseStateChanged();