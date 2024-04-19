import React, {useState} from "react";
import axios from 'axios';
import './style.css';
import KTdoc from '../../components/KTdoc'
import ContractChecker from "../../components/ContractChecker";


function Home() {
    const [displayState, setDisplayState] = useState(true)

    return (
    <div className="home">
        <div className="left-section">
            <div className="title">
               <h1>Initiative-X</h1>
            </div>
            <div className="sections">
                <ul className="section-bullets">
                    <li onClick={(e)=>setDisplayState(!displayState)}>KT generator</li>
                    <li onClick={(e)=>setDisplayState(!displayState)}>Contract Checker</li>
                </ul>
            </div>
        </div>
        {displayState && <KTdoc/>}
        {!displayState && <ContractChecker/>}
    </div>
    );
}

export default Home;