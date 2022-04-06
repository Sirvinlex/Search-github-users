import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';

const GithubContext = React.createContext();
const GithubProvider = ({children}) =>{
    const [githubUser, setGithubUser] = useState(mockUser);
    const [repos, setRepos] = useState(mockRepos);
    const [followers, setFollowers] = useState(mockFollowers);
    const [request, setRequest] = useState(0);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({show: false, msg: ''})

    const searchGithubUser = async(user) =>{
        toggleError()
        setLoading(true)
        const response = await axios(`${rootUrl}/users/${user}`)
        .catch(error => console.log(error))
        console.log(response)
        if(response){
            setGithubUser(response.data)
            const {login, followers_url} = response.data;
            axios(`${rootUrl}/users/${login}/repos?per_page=100`)
            .then((response) => setRepos(response.data))

             axios(`${followers_url}?per_page=100`)
            .then((response) => setFollowers(response.data))
           //repos
           //https://api.github.com/users/john-smilga/repos?per_page=100
           //followers
           //https://api.github.com/users/john-smilga/followers
        }
        else{
            toggleError(true, 'Sorry! No user matched this username')
            
        }
        setLoading(false);
        checkRequest()
    }

    //check rate
const checkRequest = () =>{
    axios(`${rootUrl}/rate_limit`)
    .then(({data}) =>{
        let {rate:{remaining}} = data
        
        setRequest(remaining)
        if(remaining === 0){
            toggleError(true, 'sorry you have exceeded your hourly request, try again in an hour')
        }
    })
    .catch((error) => console.log(error))
}

    //error
    const toggleError = (show= false, msg= '') =>{
        setError({show:show, msg:msg})
    }

    useEffect(checkRequest, [])
    return(
        <GithubContext.Provider value={{githubUser, repos, followers, request, error,loading, searchGithubUser}}>
         {children}
        </GithubContext.Provider>
    )

}
export {GithubContext, GithubProvider}

