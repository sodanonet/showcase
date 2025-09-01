import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: Date;
  isActive: boolean;
}

type SortDirection = 'asc' | 'desc';
type SortableKeys = keyof Employee;

interface SortConfig {
  key: SortableKeys;
  direction: SortDirection;
}

@Component('ts-data-grid')
export class DataGrid extends BaseWebComponent {
  private employees: Employee[] = [
    { id: 1, name: 'Alice Johnson', position: 'Senior Developer', department: 'Engineering', salary: 95000, startDate: new Date('2020-01-15'), isActive: true },
    { id: 2, name: 'Bob Smith', position: 'Product Manager', department: 'Product', salary: 105000, startDate: new Date('2019-03-22'), isActive: true },
    { id: 3, name: 'Carol White', position: 'UX Designer', department: 'Design', salary: 78000, startDate: new Date('2021-07-10'), isActive: false },
    { id: 4, name: 'David Brown', position: 'DevOps Engineer', department: 'Engineering', salary: 92000, startDate: new Date('2020-11-05'), isActive: true },
    { id: 5, name: 'Eva Green', position: 'Data Scientist', department: 'Analytics', salary: 110000, startDate: new Date('2018-09-18'), isActive: true },
    { id: 6, name: 'Frank Miller', position: 'QA Engineer', department: 'Engineering', salary: 75000, startDate: new Date('2022-02-14'), isActive: true },
    { id: 7, name: 'Grace Lee', position: 'Marketing Manager', department: 'Marketing', salary: 85000, startDate: new Date('2019-12-01'), isActive: false },
    { id: 8, name: 'Henry Wilson', position: 'Full Stack Developer', department: 'Engineering', salary: 88000, startDate: new Date('2021-04-20'), isActive: true }
  ];

  private filteredEmployees: Employee[] = [];
  private currentSort: SortConfig | null = null;
  private searchTerm: string = '';
  private selectedDepartment: string = 'all';

  static get observedAttributes(): string[] {
    return ['page-size', 'sortable', 'filterable'];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.filteredEmployees = [...this.employees];
  }

  protected getTemplate(): string {
    const pageSize = this.getNumberAttribute('page-size', 10);
    const isSortable = this.getBooleanAttribute('sortable');
    const isFilterable = this.getBooleanAttribute('filterable');
    
    const departments = ['all', ...new Set(this.employees.map(emp => emp.department))];
    
    return `
      <div class="data-grid-container">
        <h3>Employee Data Grid</h3>
        <p class="grid-description">
          TypeScript interfaces, generics, and type-safe data manipulation with Web Components.
        </p>

        ${isFilterable ? `
          <div class="grid-filters">
            <div class="filter-group">
              <input 
                type="text" 
                placeholder="Search employees..." 
                class="search-input"
                value="${this.searchTerm}"
              />
            </div>
            <div class="filter-group">
              <select class="department-filter">
                ${departments.map(dept => `
                  <option value="${dept}" ${this.selectedDepartment === dept ? 'selected' : ''}>
                    ${dept === 'all' ? 'All Departments' : dept}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="filter-stats">
              <span class="stat">Total: ${this.filteredEmployees.length}</span>
              <span class="stat">Active: ${this.filteredEmployees.filter(emp => emp.isActive).length}</span>
            </div>
          </div>
        ` : ''}

        <div class="grid-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                ${this.getTableHeaders(isSortable)}
              </tr>
            </thead>
            <tbody>
              ${this.getTableRows().slice(0, pageSize)}
            </tbody>
          </table>
        </div>

        <div class="grid-summary">
          <div class="summary-card">
            <h4>Summary Statistics</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Average Salary</span>
                <span class="stat-value">$${this.getAverageSalary().toLocaleString()}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Employees</span>
                <span class="stat-value">${this.filteredEmployees.length}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Departments</span>
                <span class="stat-value">${new Set(this.filteredEmployees.map(emp => emp.department)).size}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Active Rate</span>
                <span class="stat-value">${Math.round((this.filteredEmployees.filter(emp => emp.isActive).length / this.filteredEmployees.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getTableHeaders(isSortable: boolean): string {
    const headers = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'salary', label: 'Salary' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'isActive', label: 'Status' }
    ];

    return headers.map(header => {
      const sortIcon = this.getSortIcon(header.key as SortableKeys);
      const sortableClass = isSortable ? 'sortable' : '';
      
      return `
        <th class="${sortableClass}" data-sort-key="${header.key}">
          ${header.label}
          ${isSortable ? `<span class="sort-icon">${sortIcon}</span>` : ''}
        </th>
      `;
    }).join('');
  }

  private getTableRows(): string {
    return this.filteredEmployees.map(employee => `
      <tr class="${employee.isActive ? 'active' : 'inactive'}">
        <td>${employee.id}</td>
        <td class="name-cell">${employee.name}</td>
        <td>${employee.position}</td>
        <td>
          <span class="department-badge" data-department="${employee.department.toLowerCase()}">
            ${employee.department}
          </span>
        </td>
        <td class="salary-cell">$${employee.salary.toLocaleString()}</td>
        <td>${this.formatDate(employee.startDate)}</td>
        <td>
          <span class="status-badge ${employee.isActive ? 'active' : 'inactive'}">
            ${employee.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
      </tr>
    `).join('');
  }

  private getSortIcon(key: SortableKeys): string {
    if (!this.currentSort || this.currentSort.key !== key) {
      return '⇅';
    }
    return this.currentSort.direction === 'asc' ? '↑' : '↓';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private getAverageSalary(): number {
    if (this.filteredEmployees.length === 0) return 0;
    const total = this.filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0);
    return Math.round(total / this.filteredEmployees.length);
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
      }

      .data-grid-container {
        background: rgba(255, 255, 255, 0.05);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      h3 {
        color: #667eea;
        margin: 0 0 8px 0;
        font-size: 1.4rem;
      }

      .grid-description {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 24px 0;
        line-height: 1.5;
      }

      .grid-filters {
        display: flex;
        gap: 16px;
        margin: 0 0 24px 0;
        flex-wrap: wrap;
        align-items: center;
      }

      .filter-group {
        flex: 1;
        min-width: 200px;
      }

      .search-input, .department-filter {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        backdrop-filter: blur(5px);
      }

      .search-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .filter-stats {
        display: flex;
        gap: 12px;
        white-space: nowrap;
      }

      .stat {
        background: rgba(255, 255, 255, 0.1);
        padding: 6px 12px;
        border-radius: 4px;
        color: #667eea;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .grid-wrapper {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 24px;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
      }

      .data-table th,
      .data-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .data-table th {
        background: rgba(255, 255, 255, 0.1);
        color: #667eea;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.8rem;
        letter-spacing: 0.5px;
        position: sticky;
        top: 0;
      }

      .data-table th.sortable {
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
      }

      .data-table th.sortable:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .sort-icon {
        margin-left: 4px;
        opacity: 0.7;
      }

      .data-table td {
        color: #fff;
      }

      .data-table tr:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      .data-table tr.inactive {
        opacity: 0.6;
      }

      .name-cell {
        font-weight: 600;
        color: #667eea;
      }

      .salary-cell {
        font-weight: 600;
        color: #27ae60;
        font-family: monospace;
      }

      .department-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .department-badge[data-department="engineering"] {
        background: rgba(52, 152, 219, 0.2);
        color: #3498db;
        border: 1px solid #3498db;
      }

      .department-badge[data-department="product"] {
        background: rgba(155, 89, 182, 0.2);
        color: #9b59b6;
        border: 1px solid #9b59b6;
      }

      .department-badge[data-department="design"] {
        background: rgba(230, 126, 34, 0.2);
        color: #e67e22;
        border: 1px solid #e67e22;
      }

      .department-badge[data-department="analytics"] {
        background: rgba(39, 174, 96, 0.2);
        color: #27ae60;
        border: 1px solid #27ae60;
      }

      .department-badge[data-department="marketing"] {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
      }

      .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-badge.active {
        background: rgba(39, 174, 96, 0.2);
        color: #27ae60;
        border: 1px solid #27ae60;
      }

      .status-badge.inactive {
        background: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
        border: 1px solid #e74c3c;
      }

      .grid-summary {
        margin-top: 24px;
      }

      .summary-card {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .summary-card h4 {
        color: #667eea;
        margin: 0 0 16px 0;
        font-size: 1.2rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
      }

      .stat-item {
        text-align: center;
      }

      .stat-label {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        margin-bottom: 4px;
      }

      .stat-value {
        display: block;
        color: #667eea;
        font-size: 1.3rem;
        font-weight: 700;
      }

      @media (max-width: 768px) {
        .grid-filters {
          flex-direction: column;
        }
        
        .filter-group {
          width: 100%;
        }
        
        .filter-stats {
          justify-content: center;
        }
        
        .data-table {
          font-size: 0.8rem;
        }
        
        .data-table th,
        .data-table td {
          padding: 8px;
        }
        
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }

  protected setupEventListeners(): void {
    this.shadow.addEventListener('click', this.handleTableClick.bind(this));
    this.shadow.addEventListener('input', this.handleFilterInput.bind(this));
    this.shadow.addEventListener('change', this.handleFilterChange.bind(this));
  }

  private handleTableClick(event: Event): void {
    const target = event.target as HTMLElement;
    const sortKey = target.closest('th.sortable')?.getAttribute('data-sort-key') as SortableKeys;
    
    if (sortKey) {
      this.sortBy(sortKey);
    }
  }

  private handleFilterInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.classList.contains('search-input')) {
      this.searchTerm = target.value;
      this.applyFilters();
    }
  }

  private handleFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.classList.contains('department-filter')) {
      this.selectedDepartment = target.value;
      this.applyFilters();
    }
  }

  private sortBy(key: SortableKeys): void {
    const direction: SortDirection = 
      this.currentSort?.key === key && this.currentSort.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    this.currentSort = { key, direction };
    
    this.filteredEmployees.sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];
      
      // Handle different data types
      if (aVal instanceof Date && bVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      else if (aVal > bVal) comparison = 1;
      
      return direction === 'desc' ? -comparison : comparison;
    });
    
    this.render();
    this.emit('sorted', { key, direction });
  }

  private applyFilters(): void {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = this.searchTerm === '' || 
        employee.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = this.selectedDepartment === 'all' || 
        employee.department === this.selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
    
    // Reapply current sort if any
    if (this.currentSort) {
      this.sortBy(this.currentSort.key);
    } else {
      this.render();
    }
    
    this.emit('filtered', { 
      searchTerm: this.searchTerm, 
      department: this.selectedDepartment,
      resultCount: this.filteredEmployees.length 
    });
  }

  // Public API methods
  public getData(): Readonly<Employee[]> {
    return [...this.filteredEmployees];
  }

  public addEmployee(employee: Omit<Employee, 'id'>): void {
    const newEmployee: Employee = {
      ...employee,
      id: Math.max(...this.employees.map(emp => emp.id)) + 1
    };
    this.employees.push(newEmployee);
    this.applyFilters();
  }

  public removeEmployee(id: number): boolean {
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees.splice(index, 1);
      this.applyFilters();
      return true;
    }
    return false;
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = 'all';
    this.currentSort = null;
    this.filteredEmployees = [...this.employees];
    this.render();
  }
}