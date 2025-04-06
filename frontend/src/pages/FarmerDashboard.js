import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FarmerDashboard.css';

function FarmerDashboard() {
  const [queries, setQueries] = useState([]);
  const [formData, setFormData] = useState({ question: '' });
  const [files, setFiles] = useState([]); // Changed from images to files
  const [editQueryId, setEditQueryId] = useState(null);
  const [editFormData, setEditFormData] = useState({ question: '' });
  const [editFiles, setEditFiles] = useState([]); // Changed from editImages to editFiles

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/queries`);
      setQueries(res.data.filter(q => q.farmerId._id === localStorage.getItem('userId')));
    } catch (error) {
      console.error('Fetch queries error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('farmerId', localStorage.getItem('userId'));
    data.append('question', formData.question);
    files.forEach(file => data.append('images', file)); // Still using 'images' key for backend compatibility
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/users/queries`, data);
      setFormData({ question: '' });
      setFiles([]);
      fetchQueries();
    } catch (error) {
      console.error('Submit query error:', error);
      alert('Failed to submit query');
    }
  };

  const handleEdit = (query) => {
    setEditQueryId(query._id);
    setEditFormData({ question: query.question });
    setEditFiles([]); // Reset files; user can re-upload
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    if (editFormData.question) data.append('question', editFormData.question);
    editFiles.forEach(file => data.append('images', file));
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/queries/${editQueryId}`, data);
      setEditQueryId(null);
      setEditFormData({ question: '' });
      setEditFiles([]);
      fetchQueries();
    } catch (error) {
      console.error('Update query error:', error);
      alert('Failed to update query');
    }
  };

  const handleDelete = async (queryId) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/queries/${queryId}`);
        fetchQueries();
      } catch (error) {
        console.error('Delete query error:', error);
        alert('Failed to delete query');
      }
    }
  };

  const renderFile = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    const url = `${process.env.REACT_APP_API_URL}/${filePath}`;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={url} alt="attachment" />;
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return <video controls src={url} />;
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return <audio controls src={url} />;
    } else if (extension === 'pdf') {
      return <a href={url} target="_blank" rel="noopener noreferrer">View PDF</a>;
    } else {
      return <a href={url} target="_blank" rel="noopener noreferrer">Download File</a>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sessionExpiry');
    window.location.href = '/';
  };

  return (
    <div className="farmer-dashboard">
      <div className="dashboard-header">
        <h1>Farmer Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <form onSubmit={handleSubmit} className="query-form">
        <textarea
          placeholder="Ask your question"
          value={formData.question}
          onChange={e => setFormData({ ...formData, question: e.target.value })}
        />
        <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
        <button type="submit" className="submit-btn">Submit Query</button>
      </form>
      <div className="queries-list">
        {queries.map(query => (
          <div key={query._id} className="query-item">
            {editQueryId === query._id ? (
              <form onSubmit={handleUpdate} className="edit-form">
                <textarea
                  value={editFormData.question}
                  onChange={e => setEditFormData({ ...editFormData, question: e.target.value })}
                />
                <input type="file" multiple onChange={e => setEditFiles([...e.target.files])} />
                <div className="edit-actions">
                  <button type="submit" className="update-btn">Update</button>
                  <button type="button" onClick={() => setEditQueryId(null)} className="cancel-btn">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p className="query-text">{query.question}</p>
                <div className="file-gallery">
                  {query.images.map((file, index) => (
                    <div key={index} className="file-item">
                      {renderFile(file)}
                    </div>
                  ))}
                </div>
                <div className="query-actions">
                  <button onClick={() => handleEdit(query)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(query._id)} className="delete-btn">Delete</button>
                </div>
                {query.response && (
                  <div className="response">
                    <p className="response-text">Response: {query.response}</p>
                    <div className="file-gallery">
                      {query.responseImages.map((file, index) => (
                        <div key={index} className="file-item">
                          {renderFile(file)}
                        </div>
                      ))}
                    </div>
                    <p className="scientist-info">
                      By: <span>{query.scientistId.name}</span> | 
                      Mobile: <a href={`tel:${query.scientistId.mobile}`}>{query.scientistId.mobile}</a> | 
                      Qualification: <span>{query.scientistId.qualification}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmerDashboard;
