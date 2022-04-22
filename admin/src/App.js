import React from "react";
import { BrowserRouter as Router, Routes, Route  } from "react-router-dom";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import GetArticle from "./components/getArticle/GetArticle";

import GetPost from './components/getpost/GetPost'

function App() {
  
  

    return (
       
        <>  
           <div className="App container mt-5">
                <GetPost/>
    </div>
     
     <div className="App container mt-5">
     <GetArticle/>
    </div>
</>
    );
}

export default App;
