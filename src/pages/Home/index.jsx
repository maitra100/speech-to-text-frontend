import React, {useState} from "react";
import axios from 'axios';


function Home() {
    const [file, setFile] = useState()

    function handleChange(event) {
        setFile(event.target.files[0])
    }

    function handleSubmit(event) {
        event.preventDefault()
        const url = 'http://localhost:8000/uploadFile';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        const config = {
          headers: {
            'content-type': 'multipart/form-data',
          },
        };
        axios.post(url, formData, config).then((response) => {
            window.open(response.data, "_blank")
        }).catch((error) => {
            console.log(error,'error');
        });
    
    }
    return (
    <div>
        <form onSubmit={handleSubmit}>
            <h1>React File Upload</h1>
            <input type="file" onChange={handleChange}/>
            <button type="submit">Upload</button>
        </form>
    </div>
    );
}

export default Home;