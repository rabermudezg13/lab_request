// Loading indicator functions
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Navigation functions
function showForm() {
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('dataframeSection').style.display = 'none';
}

function showSearch() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('dataframeSection').style.display = 'none';
}

function showDataframe() {
    document.getElementById('formSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('dataframeSection').style.display = 'block';
    updateDataframe();
}

// Form submission
document.addEventListener('DOMContentLoaded', function() {
    const labRequestForm = document.getElementById('labRequestForm');
    
    labRequestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        showLoading();
        
        try {
            const labRequest = {
                name: document.getElementById('name').value,
                id: document.getElementById('id').value,
                email: document.getElementById('email').value,
                visitDate: document.getElementById('visitDate').value,
                labRequestDate: document.getElementById('labRequestDate').value,
                status: document.getElementById('status').value,
                createdAt: new Date().toISOString()
            };
            
            console.log('Saving lab request:', labRequest);
            await db.collection('labRequests').add(labRequest);
            console.log('Lab request saved successfully');
            
            alert('Lab request added successfully');
            this.reset();
            showDataframe();
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving lab request: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Edit form submission
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        showLoading();

        try {
            const id = document.getElementById('editId').value;
            const updatedRequest = {
                name: document.getElementById('editName').value,
                id: document.getElementById('editIdNumber').value,
                email: document.getElementById('editEmail').value,
                visitDate: document.getElementById('editVisitDate').value,
                labRequestDate: document.getElementById('editLabRequestDate').value,
                status: document.getElementById('editStatus').value,
                updatedAt: new Date().toISOString()
            };

            await db.collection('labRequests').doc(id).update(updatedRequest);
            closeModal();
            updateDataframe();
            if (document.getElementById('searchSection').style.display !== 'none') {
                searchRequests();
            }
            alert('Lab request updated successfully');
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating lab request: ' + error.message);
        } finally {
            hideLoading();
        }
    });

    // Modal close handlers
    document.querySelector('.close').addEventListener('click', closeModal);
    window.onclick = function(event) {
        if (event.target == document.getElementById('editModal')) {
            closeModal();
        }
    }

    // Initial load
    showForm();
});

// Search function
async function searchRequests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    showLoading();

    try {
        const snapshot = await db.collection('labRequests').get();
        const requests = [];
        
        snapshot.forEach(doc => {
            const request = doc.data();
            if (request.name.toLowerCase().includes(searchTerm) || 
                request.id.toLowerCase().includes(searchTerm)) {
                requests.push({ id: doc.id, ...request });
            }
        });

        if (requests.length === 0) {
            resultsDiv.innerHTML = '<p>No results found</p>';
            return;
        }

        requests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <h3>${request.name}</h3>
                <p><strong>ID:</strong> ${request.id}</p>
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Visit Date:</strong> ${request.visitDate}</p>
                <p><strong>Lab Request Date:</strong> ${request.labRequestDate}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${request.status.toLowerCase().replace(' ', '-')}">${request.status}</span></p>
                <div class="card-actions">
                    <button onclick="editRequest('${request.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteRequest('${request.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p>Error searching lab requests</p>';
    } finally {
        hideLoading();
    }
}

// Modal and edit functions
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function editRequest(id) {
    showLoading();
    try {
        const doc = await db.collection('labRequests').doc(id).get();
        if (doc.exists) {
            const request = doc.data();
            
            document.getElementById('editId').value = id;
            document.getElementById('editName').value = request.name;
            document.getElementById('editIdNumber').value = request.id;
            document.getElementById('editEmail').value = request.email;
            document.getElementById('editVisitDate').value = request.visitDate;
            document.getElementById('editLabRequestDate').value = request.labRequestDate;
            document.getElementById('editStatus').value = request.status;
            
            document.getElementById('editModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading lab request data');
    } finally {
        hideLoading();
    }
}

// Delete function
async function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this lab request?')) {
        showLoading();
        try {
            await db.collection('labRequests').doc(id).delete();
            updateDataframe();
            if (document.getElementById('searchSection').style.display !== 'none') {
                searchRequests();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting lab request: ' + error.message);
        } finally {
            hideLoading();
        }
    }
}

// Update dataframe
async function updateDataframe() {
    showLoading();
    try {
        const snapshot = await db.collection('labRequests').get();
        const tbody = document.getElementById('dataframeBody');
        tbody.innerHTML = '';

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">No data available</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const request = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${request.name || ''}</td>
                <td>${request.id || ''}</td>
                <td>${request.email || ''}</td>
                <td>${request.visitDate || ''}</td>
                <td>${request.labRequestDate || ''}</td>
                <td><span class="status-badge status-${(request.status || '').toLowerCase().replace(' ', '-')}">${request.status || ''}</span></td>
                <td>
                    <button onclick="editRequest('${doc.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteRequest('${doc.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading data: ' + error.message);
    } finally {
        hideLoading();
    }
}
