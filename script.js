let apiUrl = 'https://api.github.com/users/thapatechnical/repos'; 
let currentPage = 1;
let repositoriesPerPage = 10;
let totalPages = 1;

function fetchUserProfile() {
    // Fetch user profile data from GitHub API
    fetch(apiUrl.replace('/repos', ''))
        .then(response => response.json())
        .then(user => {
            // Update the user profile container with user data
            const userProfileContainer = document.getElementById('user-profile');
            userProfileContainer.innerHTML = `
                <img src="${user.avatar_url}" alt="${user.login}" class="img-fluid rounded-circle mb-2" style="max-width: 100px;">
                <h2>${user.name || user.login}</h2>
                <p>${user.bio || 'No bio available.'}</p>
                <p>${user.location || 'Location not specified.'}</p>
                <p>
                    <a href="${user.html_url}" target="_blank" class="btn btn-primary">View Profile</a>
                </p>
            `;
        })
        .catch(error => console.error('Error fetching user profile:', error));
}

function fetchRepositories() {
    // Show loader while fetching repositories
    document.getElementById('loader').style.display = 'block';

    // Fetch repositories from GitHub API
    fetch(`${apiUrl}?per_page=${repositoriesPerPage}&page=${currentPage}`)
        .then(response => {
            // Check if the response has Link header for pagination
            const linkHeader = response.headers.get('Link');
            if (linkHeader) {
                // Extract total pages from Link header
                const totalPagesMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
                if (totalPagesMatch) {
                    totalPages = parseInt(totalPagesMatch[1]);
                }
            }
            return response.json();
        })
        .then(repositories => {
            // Update the repositories container with repository data
            const repositoriesContainer = document.getElementById('repositories');
            repositoriesContainer.innerHTML = '';

            repositories.forEach(repo => {
                const repositoryBox = document.createElement('div');
                repositoryBox.className = 'card mb-4';
                repositoryBox.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description || 'No description available.'}</p>
                        <p class="card-text programming-language"> ${repo.language || 'Not specified.'}</p>
                    </div>
                `;
                repositoriesContainer.appendChild(repositoryBox);
            });

            // Update pagination controls
            updatePagination();
        })
        .catch(error => console.error('Error fetching repositories:', error))
        .finally(() => {
            // Hide loader after fetching repositories
            document.getElementById('loader').style.display = 'none';
        });
}

function updatePagination() {
    // Update the pagination container with page links
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Display a maximum of 9 pages
    const maxPagesToShow = 9;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPagesToShow / 2), totalPages - maxPagesToShow + 1));
    const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${currentPage === i ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
        paginationContainer.appendChild(pageItem);
    }
}

function changePage(page) {
    if (page < 1 || page > totalPages) {
        return;
    }
    currentPage = page;
    fetchRepositories();
}

// Add this function for changing repositories per page
function changeRepositoriesPerPage() {
    const selectElement = document.getElementById('repositoriesPerPageSelect');
    repositoriesPerPage = parseInt(selectElement.value);
    currentPage = 1; // Reset to the first page when changing repositories per page
    fetchRepositories();
}

// Add this function for changing the GitHub username
function changeUser() {
    const newUsername = document.getElementById('githubUsername').value.trim();

    if (newUsername !== '') {
        // Set the new GitHub username and reset to the first page
        apiUrl = `https://api.github.com/users/${newUsername}/repos`;
        currentPage = 1;
        fetchUserProfile();
        fetchRepositories();
    } else {
        alert('Please enter a valid GitHub username.');
    }
}

// Initial load
fetchUserProfile();
fetchRepositories();
