const API_URL = 'https://api.escuelajs.co/api/v1/products';
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let rowsPerPage = 10;
let sortDir = { title: 'asc', price: 'asc', id: 'asc' };

// 1. Fetch Data
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderTable();
    } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
    }
}

// 2. Render Table với các yêu cầu (Tooltip, Images)
function renderTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedItems = filteredProducts.slice(start, end);

    const tbody = document.getElementById('productTable');
    tbody.innerHTML = paginatedItems.map(item => `
        <tr class="product-row" onclick="openDetail(${item.id})">
            <td>${item.id}</td>
            <td class="position-relative">
                ${item.title}
                <div class="description-tooltip">${item.description}</div>
            </td>
            <td>$${item.price}</td>
            <td>${item.category.name}</td>
            <td><img src="${item.images[0]}" class="thumb-img" onerror="this.src='https://via.placeholder.com/50'"></td>
        </tr>
    `).join('');

    renderPagination();
}

// 3. Phân trang
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

// 4. Tìm kiếm (OnChanged/Input)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredProducts = allProducts.filter(p => p.title.toLowerCase().includes(term));
    currentPage = 1;
    renderTable();
});

// 5. Sắp xếp
function sortData(key) {
    const dir = sortDir[key] === 'asc' ? 'desc' : 'asc';
    sortDir[key] = dir;

    filteredProducts.sort((a, b) => {
        if (a[key] < b[key]) return dir === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return dir === 'asc' ? 1 : -1;
        return 0;
    });
    renderTable();
}

// 6. Thay đổi số lượng hiển thị
document.getElementById('pageSize').addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderTable();
});

// 7. Export CSV
document.getElementById('exportBtn').addEventListener('click', () => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const currentView = filteredProducts.slice(start, end);

    let csvContent = "data:text/csv;charset=utf-8,ID,Title,Price,Category\n";
    currentView.forEach(row => {
        csvContent += `${row.id},"${row.title}",${row.price},"${row.category.name}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
});

// 8. View Detail & Edit (PUT)
function openDetail(id) {
    const product = allProducts.find(p => p.id === id);
    document.getElementById('editId').value = product.id;
    document.getElementById('editTitle').value = product.title;
    document.getElementById('editPrice').value = product.price;
    new bootstrap.Modal(document.getElementById('detailModal')).show();
}

document.getElementById('editForm').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const data = {
        title: document.getElementById('editTitle').value,
        price: parseInt(document.getElementById('editPrice').value)
    };

    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        alert("Cập nhật thành công!");
        fetchData();
    }
};

// 9. Create Item (POST)
document.getElementById('createForm').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('createTitle').value,
        price: parseInt(document.getElementById('createPrice').value),
        description: document.getElementById('createDesc').value,
        categoryId: parseInt(document.getElementById('createCatId').value),
        images: ["https://placeimg.com/640/480/any"]
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        alert("Tạo mới thành công!");
        fetchData();
        bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();
    }
};

// Khởi chạy
fetchData();