import { Component, signal } from "@angular/core";
import { AppBootstrap } from "./core/app-bootstrap/app-bootstrap";

@Component({
  selector: "app-root",
  imports: [AppBootstrap],
  template: "<app-app-bootstrap />",
})
export class App {
  protected readonly title = signal("finance-web");
}
