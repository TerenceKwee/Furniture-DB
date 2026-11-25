let inventoryData = JSON.parse(sessionStorage.getItem('furnitureInventory')) || [];

let currentPage = 1;
const rowsPerPage = 8;
let activeFilter = { column: null, label: null, operator: null, value: null };
let searchQuery = '';
let editingIndex = null;

function saveToSession() {
    sessionStorage.setItem('furnitureInventory', JSON.stringify(inventoryData));
}

const addDataForm = document.getElementById('addDataForm');
if (addDataForm) {
    addDataForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newRow = {
            id: document.getElementById('id').value.trim(),
            brand: document.getElementById('brand').value.trim(),
            category: document.getElementById('category').value.trim(),
            material: document.getElementById('material').value.trim(),
            color: document.getElementById('color').value.trim(),
            inventory: Number(document.getElementById('inventory').value),
            cost: Number(document.getElementById('cost').value),
            price: Number(document.getElementById('price').value),
            sales: Number(document.getElementById('sales').value)
        };
        inventoryData.push(newRow);
        saveToSession();
        window.location.href = 'index.html';
    });
}

const tableBody = document.getElementById('tableBody');
if (tableBody) {
    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn');
    const filterMenu = document.getElementById('filterMenu');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbersContainer = document.getElementById('pageNumbers');
    const editModal = document.getElementById('editModal');
    const editDataForm = document.getElementById('editDataForm');
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllRowMenus();
        filterMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
        filterMenu.classList.remove('show');
        closeAllRowMenus();
    });
    window.addEventListener('scroll', () => {
        closeAllRowMenus();
    }, true);

    function closeAllRowMenus() {
        document.querySelectorAll('.row-action-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        currentPage = 1;
        renderTable();
    });
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    function openEditModal(actualIndex) {
        const item = inventoryData[actualIndex];
        if (!item) return;
        editingIndex = actualIndex;
        document.getElementById('editId').value = item.id;
        document.getElementById('editBrand').value = item.brand;
        document.getElementById('editCategory').value = item.category;
        document.getElementById('editMaterial').value = item.material;
        document.getElementById('editColor').value = item.color;
        document.getElementById('editInventory').value = item.inventory;
        document.getElementById('editCost').value = item.cost;
        document.getElementById('editPrice').value = item.price;
        document.getElementById('editSales').value = item.sales;
        editModal.classList.add('show');
    }

    function hideEditModal() {
        editModal.classList.remove('show');
        editingIndex = null;
    }

    closeEditModal.addEventListener('click', hideEditModal);
    cancelEditBtn.addEventListener('click', hideEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) hideEditModal();
    });

    editDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (editingIndex === null) return;
        inventoryData[editingIndex] = {
            id: document.getElementById('editId').value.trim(),
            brand: document.getElementById('editBrand').value.trim(),
            category: document.getElementById('editCategory').value.trim(),
            material: document.getElementById('editMaterial').value.trim(),
            color: document.getElementById('editColor').value.trim(),
            inventory: Number(document.getElementById('editInventory').value),
            cost: Number(document.getElementById('editCost').value),
            price: Number(document.getElementById('editPrice').value),
            sales: Number(document.getElementById('editSales').value)
        };
        saveToSession();
        hideEditModal();
        buildFilterMenu();
        renderTable();
    });

    function deleteRow(actualIndex) {
        inventoryData.splice(actualIndex, 1);
        saveToSession();
        buildFilterMenu();
        renderTable();
    }

    function matchesNumericCondition(numVal, operator, targetVal) {
        const numeric = Number(numVal);
        if (Number.isNaN(numeric)) return false;
        switch (operator) {
            case '>': return numeric > targetVal;
            case '>=': return numeric >= targetVal;
            case '<': return numeric < targetVal;
            case '<=': return numeric <= targetVal;
            case '=': return numeric === targetVal;
            default: return true;
        }
    }

    function getFilteredData() {
        return inventoryData
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const matchesSearch = Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchQuery)
                );

                let matchesFilter = true;
                if (activeFilter.column) {
                    if (activeFilter.operator) {
                        matchesFilter = matchesNumericCondition(
                            item[activeFilter.column],
                            activeFilter.operator,
                            activeFilter.value
                        );
                    } else {
                        matchesFilter = String(item[activeFilter.column]) === activeFilter.value;
                    }
                }

                return matchesSearch && matchesFilter;
            });
    }
    function buildFilterMenu() {
        const textColumns = [
            { key: 'id', label: 'ID' },
            { key: 'brand', label: 'Brand' },
            { key: 'category', label: 'Category' },
            { key: 'material', label: 'Material' },
            { key: 'color', label: 'Color' }
        ];
        const numberColumns = [
            { key: 'inventory', label: 'Inventory' },
            { key: 'cost', label: 'Cost' },
            { key: 'price', label: 'Price' },
            { key: 'sales', label: 'Sales' }
        ];
        filterMenu.innerHTML = '';
        textColumns.forEach(col => {
            const uniqueValues = [...new Set(inventoryData.map(item => item[col.key]))];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'filter-item';
            itemDiv.innerHTML = `<span>${col.label}</span><span>›</span>`;
            const submenu = document.createElement('div');
            submenu.className = 'filter-submenu';
            if (uniqueValues.length === 0) {
                submenu.innerHTML = `<div class="submenu-option" style="color:gray;">Kosong</div>`;
            } else {
                uniqueValues.forEach(val => {
                    const opt = document.createElement('div');
                    opt.className = 'submenu-option';
                    opt.textContent = val;
                    opt.addEventListener('click', (e) => {
                        e.stopPropagation();
                        activeFilter = {
                            column: col.key,
                            label: `${col.label}: ${val}`,
                            operator: null,
                            value: String(val)
                        };
                        filterBtn.innerHTML = `<span>🝖 ${activeFilter.label}</span>`;
                        filterMenu.classList.remove('show');
                        currentPage = 1;
                        renderTable();
                    });
                    submenu.appendChild(opt);
                });
            }
            itemDiv.appendChild(submenu);
            filterMenu.appendChild(itemDiv);
        });
        numberColumns.forEach(col => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'filter-item';
            itemDiv.innerHTML = `<span>${col.label}</span><span>›</span>`;
            const submenu = document.createElement('div');
            submenu.className = 'filter-submenu';
            const condBox = document.createElement('div');
            condBox.className = 'filter-condition-box';
            condBox.innerHTML = `
                <select class="cond-op">
                    <option value=">">&gt; (Lebih besar)</option>
                    <option value=">=">&ge; (Lebih besar / sama)</option>
                    <option value="<">&lt; (Lebih kecil)</option>
                    <option value="<=">&le; (Lebih kecil / sama)</option>
                    <option value="=">= (Sama dengan)</option>
                </select>
                <input type="number" class="cond-val" placeholder="Masukkan angka" step="any">
                <button type="button" class="filter-apply-btn">Apply</button>
            `;
            condBox.addEventListener('click', (e) => e.stopPropagation());
            const opSelect = condBox.querySelector('.cond-op');
            const valInput = condBox.querySelector('.cond-val');
            const applyBtn = condBox.querySelector('.filter-apply-btn');
            applyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (valInput.value === '') return;
                const operator = opSelect.value;
                const numTarget = Number(valInput.value);
                activeFilter = {
                    column: col.key,
                    label: `${col.label} ${operator} ${numTarget}`,
                    operator: operator,
                    value: numTarget
                };
                filterBtn.innerHTML = `<span>🝖 ${activeFilter.label}</span>`;
                filterMenu.classList.remove('show');
                currentPage = 1;
                renderTable();
            });
            submenu.appendChild(condBox);
            itemDiv.appendChild(submenu);
            filterMenu.appendChild(itemDiv);
        });

        const resetDiv = document.createElement('div');
        resetDiv.className = 'filter-item filter-reset';
        resetDiv.textContent = 'Reset Filter';
        resetDiv.addEventListener('click', () => {
            activeFilter = { column: null, label: null, operator: null, value: null };
            filterBtn.innerHTML = `<span>🝖 Filter Data</span>`;
            currentPage = 1;
            renderTable();
        });
        filterMenu.appendChild(resetDiv);
    }

    function renderTable() {
        const filteredEntries = getFilteredData();
        const totalPages = Math.ceil(filteredEntries.length / rowsPerPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const pageEntries = filteredEntries.slice(startIndex, endIndex);
        tableBody.innerHTML = '';

        if (pageEntries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">Data inventory akan ditampilkan di sini setelah dataset CSV diintegrasikan atau ditambahkan.</td>
                </tr>
            `;
        } else {
            pageEntries.forEach(({ item: row, index: actualIndex }) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.brand}</td>
                    <td>${row.category}</td>
                    <td>${row.material}</td>
                    <td>${row.color}</td>
                    <td>${row.inventory}</td>
                    <td>${row.cost}</td>
                    <td>${row.price}</td>
                    <td>${row.sales}</td>
                    <td class="action-cell">
                        <button type="button" class="more-btn" aria-label="Row actions">•••</button>
                        <div class="row-action-menu">
                            <button type="button" class="row-action-item edit-item">✎ Edit</button>
                            <button type="button" class="row-action-item delete-item">🗑 Delete</button>
                        </div>
                    </td>
                `;
                const moreBtn = tr.querySelector('.more-btn');
                const actionMenu = tr.querySelector('.row-action-menu');
                const editBtn = tr.querySelector('.edit-item');
                const deleteBtn = tr.querySelector('.delete-item');

                moreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = actionMenu.classList.contains('show');
                    closeAllRowMenus();
                    filterMenu.classList.remove('show');
                    if (!isOpen) {
                        const rect = moreBtn.getBoundingClientRect();
                        actionMenu.classList.add('show');
                        const menuHeight = actionMenu.offsetHeight || 80;
                        const menuWidth = actionMenu.offsetWidth || 130;
                        const spaceBelow = window.innerHeight - rect.bottom;
                        const topPos = spaceBelow < menuHeight + 12
                            ? rect.top - menuHeight - 4
                            : rect.bottom + 4;
                        const leftPos = Math.max(12, rect.right - menuWidth);
                        actionMenu.style.top = `${topPos}px`;
                        actionMenu.style.left = `${leftPos}px`;
                    }
                });
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAllRowMenus();
                    openEditModal(actualIndex);
                });
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeAllRowMenus();
                    deleteRow(actualIndex);
                });
                tableBody.appendChild(tr);
            });
        }
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        pageNumbersContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement('span');
            pageSpan.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageSpan.textContent = i;
            pageSpan.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            pageNumbersContainer.appendChild(pageSpan);
        }
    }
    buildFilterMenu();
    renderTable();
}