import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [points, setPoints] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const imgRef = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setProcessedImageUrl(null);
    setPoints([]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warn("Por favor, selecione um arquivo primeiro!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const filename = response.data.filename;
      const imageUrl = `http://127.0.0.1:5000/processed/${filename}`;
      setProcessedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    setDrawing(true);
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints([{ x, y }]);
  };

  const handleMouseMove = (event) => {
    if (!drawing) return;
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints(prevPoints => [...prevPoints, { x, y }]);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleProcessImage = async () => {
    if (points.length < 3) {
      toast.warn("Por favor, selecione uma pequena área no fundo da imagem!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        transition: Slide
      });
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/process', { points, imageUrl: processedImageUrl });
      const filename = response.data.filename;
      console.log("depurar App.js", response)
      setProcessedImageUrl(`http://127.0.0.1:5000/processed/${filename}`);
      setPoints([]);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  const handleCenterImage = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/visualcenter', { imageUrl: processedImageUrl });
      const filename = response.data.filename;
      const centeredUrl = `http://127.0.0.1:5000/processed/${filename}`;
      openNewTabWithImages(processedImageUrl, centeredUrl);
    } catch (error) {
      console.error('Erro ao centralizar a imagem:', error);
    }
  };

  const openNewTabWithImages = (originalUrl, centeredUrl) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Imagens Centralizadas</title>
            <style>
              body {
                display: flex;
                justify-content: space-around;
                align-items: center;
                height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .image-container {
                text-align: center;
              }
              img {
                max-width: 90%;
                max-height: 90vh;
                border: 2px solid #ddd;
                border-radius: 8px;
              }
              h2 {
                margin-bottom: 20px;
                font-family: Tahoma, sans-serif;
                color: #4A3A67;
              }
            </style>
          </head>
          <body>
            <div class="image-container">
              <h2>Antes da Centralização</h2>
              <img src="${originalUrl}" alt="Original Image" />
            </div>
            <div class="image-container">
              <h2>Depois da Centralização</h2>
              <img src="${centeredUrl}" alt="Centered Image" />
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      <h1>Remova o fundo de imagens aqui</h1>
      <h3>Apenas imagens com extensão: PNG, JPG, JPEG</h3>
      <div className="upload-section">
        <label className="styled-button custom-file-upload">
          <input type="file" onChange={handleFileChange} />
          Escolher Arquivo
        </label>
        {selectedFile && <p>Arquivo {selectedFile.name} selecionado</p>}
        <button className="styled-button" onClick={handleUpload}>Enviar Imagem</button>
      </div>
      {processedImageUrl && (
        <div className="image-section">
          <h2>Selecione uma pequena área do fundo:</h2>
          <div
            className="image-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imgRef}
              src={processedImageUrl}
              alt="Processed"
              style={{ cursor: 'crosshair', userSelect: 'none' }}
              onDragStart={(e) => e.preventDefault()}
            />
            {points.length > 0 && (
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  pointerEvents: 'none'
                }}
                width={imgRef.current?.width}
                height={imgRef.current?.height}
              >
                <polygon
                  points={points.map(point => `${point.x},${point.y}`).join(' ')}
                  style={{ fill: 'rgba(255, 0, 0, 0.5)', stroke: 'red', strokeWidth: 2 }}
                />
              </svg>
            )}
          </div>
          <button className="styled-button" onClick={handleProcessImage}>Remover Fundo</button>
          <button className="styled-button" onClick={handleCenterImage}>Centralizar Imagem</button>
        </div>
      )}
      
    </div>
  );
}

export default App;
