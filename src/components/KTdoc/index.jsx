import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import DownloadIcon from "@mui/icons-material/Download";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Button from "@mui/material/Button";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import Alert from "@mui/material/Alert";

function KTdoc() {
  const [file, setFile] = useState(null);
  const [fileUrls, setFileUrls] = useState({});
  const [fileState, setFileState] = useState("Upload");
  const [checkDocumentationState, setCheckDocumentationState] = useState(false);
  const [checkTranscriptState, setCheckTranscriptState] = useState(false);
  const [files, setFiles] = useState([]);

  const [uploadError, setUploadError] = useState(false);
  const handleErrorModalClose = () => {
    setUploadError(false);
  };
  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  useEffect(() => {
    axios
      .get("http://localhost:8000/files")
      .then((response) => {
        setFiles(response.data);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }, [fileState]);

  function handleSubmit(event) {
    // event.preventDefault();
    const url = "http://localhost:8000/transcribe_video";
    const formData = new FormData();
    if (file != null) {
      formData.append("file", file);
      formData.append("fileName", file.name);
      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      };
      axios
        .post(url, formData, config)
        .then((response) => {
          setFileUrls(response.data.s3_object_urls);
          setFileState("Uploaded");
        })
        .catch((error) => {
          console.log(error, "error");
        });
      handleModalClose();
      openProcessingModal();
    } else {
      setUploadError(true);
    }
  }

  function checkDocumentation() {
    axios
      .post("http://localhost:8000/check_file", {
        s3_object_url: fileUrls.documentation,
      })
      .then((response) => {
        if (response.data.success === "false") {
          alert("Document is still being uploaded");
        } else {
          setCheckDocumentationState(true);
          alert("Document has been uploaded");
        }
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }

  function checkTranscript() {
    axios
      .post("http://localhost:8000/check_file", {
        s3_object_url: fileUrls.transcript,
      })
      .then((response) => {
        if (response.data.success === "false") {
          alert("Transcript is still being uploaded");
        } else {
          setCheckTranscriptState(true);
          alert("Transcript has been uploaded");
        }
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }

  function downloadDocumentation() {
    axios
      .post("http://localhost:8000/download", {
        s3_object_url: fileUrls.documentation,
      })
      .then((response) => {
        window.open(response.data.url);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }

  function downloadTranscript() {
    axios
      .post("http://localhost:8000/download", {
        s3_object_url: fileUrls.transcript,
      })
      .then((response) => {
        window.open(response.data.url);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }

  function downloadAnyFile(s3_url) {
    axios
      .post("http://localhost:8000/download", { s3_object_url: s3_url })
      .then((response) => {
        window.open(response.data.url);
      })
      .catch((error) => {
        console.log(error, "error");
      });
  }
  function convertTimeToReadable(timeString) {
    const date = new Date(timeString);
    const timezoneOffset = new Date().getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - timezoneOffset * 60000);

    // Format the date components
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const year = adjustedDate.getFullYear();
    const month = monthNames[adjustedDate.getMonth()];
    const day = adjustedDate.getDate();
    const hours = adjustedDate.getHours();
    const minutes = String(adjustedDate.getMinutes()).padStart(2, "0");
    const period = hours < 12 ? "AM" : "PM";
    const formattedHours = hours % 12 || 12;

    // Construct the readable format
    const readableFormat = `${month} ${day}, ${year} ${formattedHours}:${minutes} ${period}`;

    return readableFormat;
  }
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const handleModalClose = () => {
    setModalIsOpen(false);
  };
  const handleModalOpen = () => {
    setModalIsOpen(true);
  };

  const [processing, setProcessing] = useState(false);
  const openProcessingModal = () => {
    setProcessing(true);
  };
  const closeProcessingModal = () => {
    setProcessing(false);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fileName", sortable: false, headerName: "File Name", width: 260 },
    { field: "fileType", headerName: "File Type", width: 260 },
    { field: "createdAt", headerName: "Created At", width: 260 },
    { field: "status", headerName: "Status", width: 260 },
    {
      field: "action",
      sortable: false,
      headerName: "Save",
      width: 70,
      renderCell: (params) => (
        <div
          onClick={() => {
            downloadAnyFile(params.row.action);
          }}
        >
          <DownloadIcon />
        </div>
      ),
    },
  ];

  let rows = files.map((file) => {
    return {
      id: file.id,
      fileName: file.filename,
      fileType: file.type.charAt(0).toUpperCase() + file.type.slice(1),
      createdAt: convertTimeToReadable(file.created_at),
      action: file.s3_url,
      status: file.is_processed === true ? "Ready" : "Processing",
    };
  });
  console.log(files);
  return (
    <div className="kt-layout">
      <h1>AI-Powered Documentation Generator</h1>
      {processing && (
        <Alert severity="success" onClose={closeProcessingModal}>
          Generating Documentation...Please wait
        </Alert>
      )}
      <Dialog
        open={modalIsOpen}
        onClose={handleModalClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const email = formJson.email;
            handleModalClose();
          },
        }}
      >
        <DialogTitle>Upload Video</DialogTitle>
        {uploadError && (
          <Alert severity="error" onClose={handleErrorModalClose}>
            File not selected
          </Alert>
        )}
        <DialogContent>
          <DialogContentText>
            Upload Video of the KT-Session/Tutorial.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <input
            onClick={() => {
              setUploadError(false);
            }}
            type="file"
            className="file-input"
            onChange={handleChange}
          />
          <button onClick={handleSubmit} className="button-3" type="button">
            Upload
          </button>
        </DialogActions>
      </Dialog>
      <div style={{ height: 630, width: "100%", marginBottom: 25 }}>
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </div>
      <Button variant="outlined" size="large" onClick={handleModalOpen}>
        Try Now
      </Button>
    </div>
  );
}

export default KTdoc;
