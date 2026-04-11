import { Component, inject } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-signup-page",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./signup-page.html",
  styleUrl: "./signup-page.css",
})
export class SignupPage {
  private readonly router = inject(Router);
  private readonly _fb = inject(FormBuilder);

  form = this._fb.group(
    {
      name: ["", [Validators.required, Validators.minLength(4)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: passwordMatch() }
  );

  signup() {
    if (this.form.valid) {
      console.log(this.form.value);
      this.router.navigateByUrl("/app");
    }
  }

  goToLogin() {
    this.router.navigateByUrl("/auth/login");
  }
}

function passwordMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get("password")?.value;
    const confirm = group.get("confirmPassword")?.value;
    return password === confirm ? null : { passwordMismatch: true };
  };
}
