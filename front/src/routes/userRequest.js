import {serverIP} from './requestConfig';

async function register(userName, email, password, university){
    const url = serverIP + '/user/register';
    try{
        let reponse = await fetch(url,{
            mode: 'cors',
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({userName: userName, email: email, password: password, university: university})
        });
        return await reponse.json();
    }catch(exception){
        return{success:false, error:exception};
    }
}


async function getUser(email){ 
    // get user information by user email
    // TODO: edit function name [getUserByEmail]
    const url = serverIP + '/user/getUserByEmail/' + email;

    try{
        let response = await fetch(url,);
        let responseJson = await response.json();
        //Should probably use status code instead of this
        if (responseJson.success){
            return responseJson.data;
        } else{
            return responseJson.error;
        }

    } catch(exception){
        return {success:false, data:exception};
    }
}

async function getUserById(userId){ // get user information by user id
    const url = serverIP + '/user/getUserById/' + userId;

    try{
        let response = await fetch(url,);
        let responseJson = await response.json();
        //Should probably use status code instead of this
        if (responseJson.success){
            return responseJson.data;
        } else{
            return responseJson.error;
        }

    } catch(exception){
        console.log(exception);
        return {success:false, data:exception};
    }
}

async function editUser(currentEmail,newEmail,newPassword,newUserName){
    const url = serverIP + '/user/editUser';
    try{
        let reponse = await fetch(url,{
            mode: 'cors',
            method: 'PUT',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({currentEmail: currentEmail, newEmail: newEmail, newPassword: newPassword, newUserName: newUserName})
        });
        return await reponse.json();
    }catch(exception){
        return{success:false, data:exception};
    }
}
async function login(email,password){
    const url = serverIP + '/login';
    try{
        let reponse = await fetch(url,{
            mode: 'cors',
            method: 'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({email: email, password: password})
        });
        return await reponse.json();
    }catch(exception){
        return{success:false, data:exception};
    }
}

async function getAllUniversities(){
    const url = serverIP + '/user/getAllUniversities/';

    try{
        let response = await fetch(url,);
        let responseJson = await response.json();
        //Should probably use status code instead of this
        if (responseJson.success){
            return responseJson.data;
        } else{
            return responseJson.error;
        }

    } catch(exception){
        return {success:false, data:exception};
    }
}

/**
 * 
 * @param {String} userId 
 * @param {String} password 
 * @return {boolean} confirm correct password or not
 */
async function confirmPassword(userId, password){
    const url = serverIP + '/user/confirmPassword/';
    try{
        let reponse = await fetch(url,{
            mode: 'cors',
            method: 'PUT',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({userId: userId, password: password})
        });
        return await reponse.json();
    }catch(exception){
        return{success:false, data:exception};
    }
}

/**
 * 
 * @param {String} email 
 * @param {String} password 
 * @returns {boolean} success or fail 
 */
async function deleteUser(userId){
    const url = serverIP + '/user/deleteUser/';
    try{
        let reponse = await fetch(url,{
            mode: 'cors',
            method: 'PUT',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:8080'
            },
            body: JSON.stringify({userId: userId})
        });
        return await reponse.json();
    }catch(exception){
        return{success:false, data:exception};
    }
}
export {register,getUser,getUserById,editUser,login,getAllUniversities,confirmPassword,deleteUser};
