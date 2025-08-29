import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <app-remote-component></app-remote-component>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'angular-remote';
}