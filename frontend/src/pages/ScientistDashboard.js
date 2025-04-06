import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ScientistDashboard.css';

function ScientistDashboard() {
  const [queries, setQueries] = useState([]);
  const [responses, setResponses] = useState({});
  const [editResponseId, setEditResponseId] = useState(null);
  const [editResponseData, setEditResponseData] = useState({ response: '' });
  const [editResponseFiles, setEditResponseFiles] = useState([]);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/queries`);
      console.log('Fetched queries:', res.data); // Debug log
      setQueries(res.data);
    } catch (error) {
      console.error('Fetch queries error:', error);
    }
  };

  const handleRespond = async (queryId) => {
    const { response, images } = responses[queryId] || {};
    if (!response) return alert('Please enter a response');
    
    const data = new FormData();
    data.append('scientistId', localStorage.getItem('userId'));
    data.append('response', response);
    images?.forEach(file => data.append('responseImages', file));
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/queries/${queryId}/respond`, data);
      setResponses(prev => ({ ...prev, [queryId]: { response: '', images: [] } }));
      fetchQueries();
    } catch (error) {
      console.error('Respond error:', error);
      alert('Failed to submit response');
    }
  };

  const handleEditResponse = (query) => {
    setEditResponseId(query._id);
    setEditResponseData({ response: query.response });
    setEditResponseFiles([]);
  };

  const handleUpdateResponse = async (e, queryId) => {
    e.preventDefault();
    const data = new FormData();
    data.append('scientistId', localStorage.getItem('userId'));
    if (editResponseData.response) data.append('response', editResponseData.response);
    editResponseFiles.forEach(file => data.append('responseImages', file));
    
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/users/queries/${queryId}/respond`, data);
      setEditResponseId(null);
      setEditResponseData({ response: '' });
      setEditResponseFiles([]);
      fetchQueries();
    } catch (error) {
      console.error('Update response error:', error);
      alert('Failed to update response');
    }
  };

  const handleDeleteResponse = async (queryId) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/queries/${queryId}/respond`, {
          params: { scientistId: localStorage.getItem('userId') }
        });
        fetchQueries();
      } catch (error) {
        console.error('Delete response error:', error);
        alert(error.response?.data?.error || 'Failed to delete response');
      }
    }
  };

  const updateResponse = (queryId, field, value) => {
    setResponses(prev => ({
      ...prev,
      [queryId]: { ...prev[queryId], [field]: value }
    }));
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
    <div className="scientist-dashboard">
      <div className="dashboard-header">
        <h1>Scientist Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <div className="queries-list">
        {queries.length === 0 ? (
          <p>No queries available.</p>
        ) : (
          queries.map(query => (
            <div key={query._id} className="query-item">
              <p className="query-text">{query.question}</p>
              <div className="file-gallery">
                {query.images.map((file, index) => (
                  <div key={index} className="file-item">
                    {renderFile(file)}
                  </div>
                ))}
              </div>
              <p className="farmer-info">
                By: <span>{query.farmerId.name}</span> | 
                Mobile: <a href={`tel:${query.farmerId.mobile}`}>{query.farmerId.mobile}</a> | 
                District: <span>{query.farmerId.district}</span>
              </p>
              {!query.response ? (
                <div className="response-form">
                  <textarea
                    placeholder="Your response"
                    value={responses[query._id]?.response || ''}
                    onChange={e => updateResponse(query._id, 'response', e.target.value)}
                  />
                  <input
                    type="file"
                    multiple
                    onChange={e => updateResponse(query._id, 'images', [...e.target.files])}
                  />
                  <button onClick={() => handleRespond(query._id)} className="respond-btn">Submit Response</button>
                </div>
              ) : editResponseId === query._id ? (
                <form onSubmit={(e) => handleUpdateResponse(e, query._id)} className="edit-response-form">
                  <textarea
                    value={editResponseData.response}
                    onChange={e => setEditResponseData({ ...editResponseData, response: e.target.value })}
                  />
                  <input type="file" multiple onChange={e => setEditResponseFiles([...e.target.files])} />
                  <div className="edit-actions">
                    <button type="submit" className="update-btn">Update</button>
                    <button type="button" onClick={() => setEditResponseId(null)} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="response">
                  <p className="response-text">Response: {query.response}</p>
                  <div className="file-gallery">
                    {query.responseImages.map((file, index) => (
                      <div key={index} className="file-item">
                        {renderFile(file)}
                      </div>
                    ))}
                  </div>
                  {query.notifications && query.notifications.length > 0 && query.scientistId._id === localStorage.getItem('userId') && (
                    <div className="notification">
                      {query.notifications.map((notification, index) => (
                        <p key={index}>{notification.message}</p>
                      ))}
                    </div>
                  )}
                  <div className="response-actions">
                    <button onClick={() => handleEditResponse(query)} className="edit-btn">Edit</button>
                    {query.scientistId._id === localStorage.getItem('userId') && (
                      <button onClick={() => handleDeleteResponse(query._id)} className="delete-btn">Delete</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ScientistDashboard;
