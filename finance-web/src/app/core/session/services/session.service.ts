import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { AuthMeData } from "../../../features/auth/models/auth-request.type";
import { AuthService } from "../../../features/auth/services/auth.service";
import { AppHttpError } from "../../http/models/app-http-error.model";
import { SessionBootstrapResult } from "../model/session-result.type";
import { SessionUser } from "../model/session-user.type";

@Injectable({
  providedIn: "root",
})
export class SessionService {
  private readonly authService = inject(AuthService);

  /**
   * Bootstraps the user's session by checking for existing authentication tokens and validating them.
   * @returns An observable that emits the bootstrap result.
   */
<<<<<<< HEAD
  login(payload: LoginRequest): Observable<AuthUser> {
    this.sessionStore.setLoading();
    this.setTenant(payload.tenantSlug); // Guardar el tenantSlug

    return this.sessionApi.login(payload).pipe(
      tap(loginResponse => {
        // Login logs
        console.log("Login response: ", loginResponse);
        this.sessionStore.setTokens(loginResponse.data);
      }),
      switchMap(() => this.sessionApi.getMe(payload.tenantSlug)),
      tap(user => {
        // getMe() logs
        console.log("getMe response: ", user);
        this.sessionStore.setAuthenticated(user);
      }),
      catchError((error: unknown) => {
        this.sessionStore.setUnauthenticated();
        this.removeTenant();
        return throwError(() => error);
      })
    );
  }

  /**
   * Loads the currently authenticated user and stores it.
   */
  loadMe(): Observable<AuthUser> {
    const tenantSlug = this.getTenant();
    return this.sessionApi.getMe(tenantSlug || undefined).pipe(
      tap(user => {
        console.log("loadMe response", user);
        this.sessionStore.setAuthenticated(user);
      }),
      catchError(err => {
        this.sessionStore.clearSession();
        return throwError(() => err);
      })
    );
  }

  /**
   * Rebuilds session state on application startup.
   */
  bootstrap(): Observable<AuthUser | null> {
    this.sessionStore.setBootstrapStarted();
    console.log("bootstraping");
    // temporal
    const session = this.sessionStore.getSessionFromStorage();

    if (!session?.accessToken) {
      this.sessionStore.clearSession();
      this.removeTenant();
      return of(null);
=======
  bootstrapSession(): Observable<SessionBootstrapResult> {
    if (!this.authService.hasTokens()) {
      return of({
        status: "unauthenticated",
        errorMessage: null,
      });
>>>>>>> 4ba55fe56d249dc41da7eeef80cbd4c51223c8d4
    }

    return this.authService.getMe().pipe(
      map(user => ({
        status: "authenticated" as const,
        user: this.toSessionUser(user),
      })),
      catchError((error: unknown) => {
        this.authService.logout();

<<<<<<< HEAD
    // if (this.sessionStore.isBootstrapping()) {
    //   return of(this.sessionStore.user());
    // }
    // if (this.sessionStore.isInitialized()) {
    //   return of(this.sessionStore.user());
    // }
    // this.sessionStore.setBootstrapStarted();

    return this.sessionApi.getMe(this.getTenant() || undefined).pipe(
      tap(user => {
        // logs
        console.log("bootstrap getMe response", user);
        this.sessionStore.setAuthenticated(user);
        console.log(
          "usuario cargado getMe",
          this.sessionStore.isAuthenticated()
        );
      }),
      catchError(() => {
        console.log("bootstrap clear session");
        this.sessionStore.clearSession();
        this.removeTenant();
        // this.sessionStore.setUnauthenticated();
        return of(null);
=======
        return of({
          status: "unauthenticated" as const,
          errorMessage: this.toErrorMessage(error),
        });
>>>>>>> 4ba55fe56d249dc41da7eeef80cbd4c51223c8d4
      })
    );
  }

  /**
   * Loads the current user's session information.
   * @returns An observable that emits the session user.
   */
  loadCurrentUser(): Observable<SessionUser> {
    return this.authService.getMe().pipe(map(user => this.toSessionUser(user)));
  }

  clearSession(): void {
    this.authService.logout();
  }

  hasSession(): boolean {
    return this.authService.hasTokens();
  }

  /**
   * Converts an AuthMeData object to a SessionUser object.
   * @param user The authenticated user's information to convert to a SessionUser object.
   * @returns A SessionUser object containing the user's session information.
   */
  private toSessionUser(user: AuthMeData): SessionUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      status: user.status,
      tenantSlug: user.tenantSlug,
      roles: user.roles,
    };
  }

  /**
   * Converts an error object to a user-friendly error message.
   * @param error The error object to convert.
   * @returns A user-friendly error message, or null if no message is available.
   */
  private toErrorMessage(error: unknown): string | null {
    const appError = error as AppHttpError | null;

    if (!appError) {
      return null;
    }

    const message =
      typeof appError.message === "string" ? appError.message.trim() : "";

    return message.length > 0 ? message : null;
  }
}
