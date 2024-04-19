import React,{useState} from "react";
import axios from 'axios';
import './style.css';


function KTdoc(){
    const [file, setFile] = useState()
    const [fileUrls, setFileUrls] = useState({})
    const [fileState, setFileState] = useState('Upload')
    const [checkDocumentationState, setCheckDocumentationState] = useState(false)
    const [checkTranscriptState, setCheckTranscriptState] = useState(false)

    function handleChange(event) {
        setFile(event.target.files[0])
    }

    function handleSubmit(event) {
        event.preventDefault()
        const url = 'http://localhost:8000/transcribe_video';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        const config = {
          headers: {
            'content-type': 'multipart/form-data',
          },
        };
        axios.post(url, formData, config).then((response) => {
            setFileUrls(response.data.s3_object_urls)
            setFileState('Uploaded')
        }).catch((error) => {
            console.log(error,'error');
        });
    }

    function checkDocumentation() {
        axios.post('http://localhost:8000/check_file', {s3_object_url: fileUrls.documentation}).then((response) => {
            if(response.data.success==='false'){
                alert('Document is still being uploaded')
            }
            else{
                setCheckDocumentationState(true)
                alert('Document has been uploaded')

            }
        }).catch((error) => {
            console.log(error,'error');
        })
    }

    function checkTranscript() {
        axios.post('http://localhost:8000/check_file', {s3_object_url: fileUrls.transcript}).then((response) => {
            if(response.data.success==='false'){
                alert('Transcript is still being uploaded')
            }
            else{
                setCheckTranscriptState(true)
                alert('Transcript has been uploaded')
            }
        }).catch((error) => {
            console.log(error,'error');
        })
    }

    function downloadDocumentation () {
        axios.post('http://localhost:8000/download', {s3_object_url: fileUrls.documentation}).then((response) => {
            window.open(response.data.url)
        }).catch((error) => {
            console.log(error,'error');
        })
    }

    function downloadTranscript() {
        axios.post('http://localhost:8000/download', {s3_object_url: fileUrls.transcript}).then((response) => {
            window.open(response.data.url)
        }).catch((error) => {
            console.log(error,'error');
        })
    }

    return (
        <div className="kt-body">
            {fileState==='Upload' && <div>
                <form onSubmit={handleSubmit}>
                    <h1>KT Video Upload</h1>
                    <input type="file" onChange={handleChange}/>
                    <button className="button-3" type="submit">Upload</button>
                </form>
            </div>}
            {fileState==='Uploaded' && <div>
                {!checkDocumentationState && <button className="button-3" onClick={checkDocumentation}>Check Documentation</button>}
                {!checkTranscriptState && <button className="button-3" onClick={checkTranscript}>Check Transcript</button>}
                {checkDocumentationState && <button className="button-3" onClick={downloadDocumentation}>Download Documentation</button>}
                {checkTranscriptState && <button className="button-3" onClick={downloadTranscript}>Download Transcript</button>}
            </div>}
        </div>
    );
}

export default KTdoc;