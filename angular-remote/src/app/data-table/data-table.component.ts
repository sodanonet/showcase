import { Component, OnInit } from '@angular/core';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: Date;
  email: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {
  employees: Employee[] = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Senior Developer',
      department: 'Engineering',
      salary: 95000,
      startDate: new Date('2020-03-15'),
      email: 'john.doe@company.com',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Product Manager',
      department: 'Product',
      salary: 105000,
      startDate: new Date('2019-08-22'),
      email: 'jane.smith@company.com',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'UX Designer',
      department: 'Design',
      salary: 78000,
      startDate: new Date('2021-01-10'),
      email: 'mike.johnson@company.com',
      status: 'active'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      position: 'DevOps Engineer',
      department: 'Engineering',
      salary: 92000,
      startDate: new Date('2020-11-05'),
      email: 'sarah.wilson@company.com',
      status: 'inactive'
    },
    {
      id: 5,
      name: 'David Brown',
      position: 'Data Analyst',
      department: 'Analytics',
      salary: 72000,
      startDate: new Date('2022-05-18'),
      email: 'david.brown@company.com',
      status: 'active'
    }
  ];
  
  filteredEmployees: Employee[] = [];
  searchTerm = '';
  selectedDepartment = 'all';
  selectedStatus = 'all';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  departments = ['Engineering', 'Product', 'Design', 'Analytics'];
  
  ngOnInit() {
    this.filteredEmployees = [...this.employees];
  }
  
  applyFilters() {
    this.filteredEmployees = this.employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          employee.position.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          employee.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = this.selectedDepartment === 'all' || 
                               employee.department === this.selectedDepartment;
      
      const matchesStatus = this.selectedStatus === 'all' || 
                           employee.status === this.selectedStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
    
    if (this.sortColumn) {
      this.applySorting();
    }
  }
  
  sort(column: keyof Employee) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    
    this.applySorting();
  }
  
  private applySorting() {
    this.filteredEmployees.sort((a, b) => {
      const aValue = a[this.sortColumn as keyof Employee];
      const bValue = b[this.sortColumn as keyof Employee];
      
      let comparison = 0;
      
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '▲' : '▼';
  }
  
  getTotalSalary(): number {
    return this.filteredEmployees.reduce((total, emp) => total + emp.salary, 0);
  }
  
  getAverageSalary(): number {
    return this.filteredEmployees.length > 0 
      ? this.getTotalSalary() / this.filteredEmployees.length 
      : 0;
  }
  
  trackByEmployeeId(index: number, employee: Employee): number {
    return employee.id;
  }
}