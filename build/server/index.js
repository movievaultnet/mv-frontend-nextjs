import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, Link, useNavigate, Navigate, useParams, useLocation } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useTheme } from "next-themes";
import { Toaster as Toaster$1 } from "sonner";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Loader2, Film, Sparkles, TrendingUp, Clapperboard, Play, Star, CheckCircle2, Trophy, Settings as Settings$1, LogOut, Clock, Tag, Brain, Search, X, Calendar, Package2, ScanLine, Filter, ChevronDownIcon, CheckIcon, ChevronUpIcon, PlusCircle, Upload, ImagePlus, XIcon, ShieldCheck, ImageIcon, Check, Plus, Globe, BadgeCheck, User, Pencil, Trash2, Library, ExternalLink, TrendingDown, Minus, Lock, Award, Mail, XCircle, Shield } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import useEmblaCarousel from "embla-carousel-react";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ProgressPrimitive from "@radix-ui/react-progress";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      },
      ...props
    }
  );
};
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "UTF-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {})]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
const parseJsonSafely = void 0;
const apiFetch = void 0;
const refreshAccessToken = void 0;
const DISCOVER_FILMS_ENDPOINT = "/api/catalog/films/tmdb/discover";
const TMDB_IMAGE_BASE_URL$1 = "https://image.tmdb.org/t/p/w500";
const DEFAULT_DISCOVER_REQUEST = {
  includeAdult: false,
  includeVideo: false,
  language: "en-US",
  page: 1,
  sortBy: "popularity.desc"
};
function mapPosterUrl(posterPath) {
  return posterPath ? `${TMDB_IMAGE_BASE_URL$1}${posterPath}` : "";
}
function mapLandingMovie(movie) {
  return {
    id: String(movie.id),
    title: movie.title,
    synopsis: movie.overview,
    posterUrl: mapPosterUrl(movie.poster_path),
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : "TBA",
    rating: movie.vote_average,
    trailerKey: movie.trailer_key
  };
}
async function fetchDiscoverFilms(request = DEFAULT_DISCOVER_REQUEST) {
  var _a;
  const response = await apiFetch(DISCOVER_FILMS_ENDPOINT, {
    method: "POST",
    auth: "none",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });
  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Discover request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.results)) {
    throw new Error("Invalid discover response");
  }
  return payload;
}
const landingService = {
  async getDiscoverMovies(request = {}) {
    const payload = await fetchDiscoverFilms({
      ...DEFAULT_DISCOVER_REQUEST,
      ...request
    });
    return payload.data.results.map(mapLandingMovie);
  },
  async getLandingPayload() {
    const payload = await fetchDiscoverFilms(DEFAULT_DISCOVER_REQUEST);
    const movies = payload.data.results.map(mapLandingMovie);
    const averageRating = movies.reduce((acc, movie) => acc + movie.rating, 0) / Math.max(movies.length, 1);
    return {
      heroMovies: movies.slice(0, 4),
      spotlightMovies: movies.slice(0, 2),
      collections: [
        {
          id: "discover-grid",
          title: "Discover Feed",
          description: "The first page of the TMDB discover feed, sorted by popularity.",
          movies: movies.slice(0, 6)
        },
        {
          id: "fresh-picks",
          title: "Fresh Picks",
          description: "A tighter subset for the editorial part of the landing.",
          movies: movies.slice(2, 6)
        },
        {
          id: "worth-a-look",
          title: "Worth A Look",
          description: "Additional titles surfaced from the same discover request.",
          movies: movies.slice(6, 10)
        }
      ],
      stats: {
        currentPage: payload.data.page,
        totalPages: payload.data.total_pages,
        totalResults: payload.data.total_results.toLocaleString("en-US"),
        averageRating: averageRating.toFixed(1)
      }
    };
  }
};
const TOKEN_KEY = "movievault_token";
const USER_KEY = "movievault_user";
const SIGNED_OUT_KEY = "movievault_signed_out";
const TOKEN_EXPIRY_SKEW_SECONDS = 30;
const isBrowser = typeof window !== "undefined";
function storageGet(key) {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
}
function storageSet(key, value) {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
}
function storageRemove(key) {
  if (!isBrowser) return;
  localStorage.removeItem(key);
}
function inferDisplayName(email, username) {
  if (username && username.trim()) {
    return username.trim();
  }
  const localPart = email.split("@")[0] || "MovieVault User";
  return localPart.split(/[._-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function normalizeRole(role) {
  if (role === "ADMIN" || role === "MODERATOR" || role === "USER") {
    return role;
  }
  if (typeof role === "string") {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === "ADMIN" || normalizedRole === "MODERATOR" || normalizedRole === "USER") {
      return normalizedRole;
    }
  }
  return "USER";
}
function decodeJwtPayload(token) {
  try {
    const [, base64Payload] = token.split(".");
    if (!base64Payload) {
      return null;
    }
    const normalized = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function extractPrimaryRole(jwtPayload) {
  const roles = jwtPayload == null ? void 0 : jwtPayload.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    return normalizeRole(roles[0]);
  }
  return "USER";
}
function deriveEmail(username, explicitEmail) {
  if (explicitEmail && explicitEmail.trim()) {
    return explicitEmail.trim();
  }
  if (username.includes("@")) {
    return username;
  }
  return username || "unknown-user";
}
function persistSession(token, username, options = {}) {
  const jwtPayload = decodeJwtPayload(token);
  const subject = jwtPayload == null ? void 0 : jwtPayload.sub;
  const previousUser = getStoredUser();
  const email = deriveEmail(username, options.email ?? (previousUser == null ? void 0 : previousUser.email));
  const user = {
    id: typeof subject === "string" && subject.trim() ? subject : email,
    email,
    name: inferDisplayName(email, username),
    role: extractPrimaryRole(jwtPayload),
    emailVerified: (previousUser == null ? void 0 : previousUser.emailVerified) ?? true,
    avatar: previousUser == null ? void 0 : previousUser.avatar,
    createdAt: (previousUser == null ? void 0 : previousUser.createdAt) ?? options.timestamp ?? (/* @__PURE__ */ new Date()).toISOString()
  };
  storageSet(TOKEN_KEY, token);
  storageSet(USER_KEY, JSON.stringify(user));
  clearSignedOutMarker();
  return user;
}
function clearSession() {
  storageRemove(TOKEN_KEY);
  storageRemove(USER_KEY);
}
function markSignedOut() {
  clearSession();
  storageSet(SIGNED_OUT_KEY, "true");
}
function clearSignedOutMarker() {
  storageRemove(SIGNED_OUT_KEY);
}
function isSignedOut() {
  return storageGet(SIGNED_OUT_KEY) === "true";
}
function getStoredToken() {
  return storageGet(TOKEN_KEY);
}
function getStoredUser() {
  const userStr = storageGet(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}
function isTokenExpired(token) {
  const jwtPayload = decodeJwtPayload(token);
  const exp = jwtPayload == null ? void 0 : jwtPayload.exp;
  if (typeof exp !== "number") {
    return false;
  }
  const nowInSeconds = Math.floor(Date.now() / 1e3);
  return exp <= nowInSeconds + TOKEN_EXPIRY_SKEW_SECONDS;
}
function hasUsableSession() {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) {
    return false;
  }
  return !isTokenExpired(token);
}
const delay$1 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const authService = {
  async login(credentials) {
    var _a, _b, _c;
    let response;
    try {
      response = await apiFetch("/api/auth/login", {
        method: "POST",
        auth: "none",
        retryOnUnauthorized: false,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "",
          email: credentials.email,
          password: credentials.password
        })
      });
    } catch {
      throw new Error("Unable to reach auth service");
    }
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? (payload == null ? void 0 : payload.details) ?? `Login failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    const token = (_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.token;
    const username = (_b = payload == null ? void 0 : payload.data) == null ? void 0 : _b.username;
    if (!token || !username) {
      throw new Error("Invalid auth response");
    }
    const user = persistSession(token, username, {
      email: credentials.email,
      timestamp: (_c = payload == null ? void 0 : payload.meta) == null ? void 0 : _c.timestamp
    });
    return { token, user };
  },
  async ensureAuthenticated() {
    if (isSignedOut()) {
      return false;
    }
    if (hasUsableSession()) {
      return true;
    }
    return refreshAccessToken();
  },
  async register(data) {
    await delay$1(800);
    throw new Error(`Register is not wired to the backend yet for ${data.email}`);
  },
  async resetPassword(email) {
    await delay$1(800);
    console.log(`Password reset email sent to ${email}`);
  },
  async verifyEmail() {
    await delay$1(500);
    const user = this.getCurrentUser();
    if (user) {
      user.emailVerified = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("movievault_user", JSON.stringify(user));
      }
    }
  },
  logout() {
    markSignedOut();
  },
  clearSession() {
    clearSession();
  },
  getToken() {
    return getStoredToken();
  },
  getCurrentUser() {
    return getStoredUser();
  },
  isAuthenticated() {
    return hasUsableSession();
  }
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const CarouselContext = React.createContext(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y"
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const onSelect = React.useCallback((api2) => {
    if (!api2) return;
    setCanScrollPrev(api2.canScrollPrev());
    setCanScrollNext(api2.canScrollNext());
  }, []);
  const scrollPrev = React.useCallback(() => {
    api == null ? void 0 : api.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api == null ? void 0 : api.scrollNext();
  }, [api]);
  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );
  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);
  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api == null ? void 0 : api.off("select", onSelect);
    };
  }, [api, onSelect]);
  return /* @__PURE__ */ jsx(
    CarouselContext.Provider,
    {
      value: {
        carouselRef,
        api,
        opts,
        orientation: orientation || ((opts == null ? void 0 : opts.axis) === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          onKeyDownCapture: handleKeyDown,
          className: cn("relative", className),
          role: "region",
          "aria-roledescription": "carousel",
          "data-slot": "carousel",
          ...props,
          children
        }
      )
    }
  );
}
function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: carouselRef,
      className: "overflow-hidden",
      "data-slot": "carousel-content",
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className
          ),
          ...props
        }
      )
    }
  );
}
function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "group",
      "aria-roledescription": "slide",
      "data-slot": "carousel-item",
      className: cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      ),
      ...props
    }
  );
}
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-slot": "carousel-previous",
      variant,
      size,
      className: cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal" ? "top-1/2 -left-12 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollPrev,
      onClick: scrollPrev,
      ...props,
      children: [
        /* @__PURE__ */ jsx(ArrowLeft, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Previous slide" })
      ]
    }
  );
}
function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();
  return /* @__PURE__ */ jsxs(
    Button,
    {
      "data-slot": "carousel-next",
      variant,
      size,
      className: cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal" ? "top-1/2 -right-12 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      ),
      disabled: !canScrollNext,
      onClick: scrollNext,
      ...props,
      children: [
        /* @__PURE__ */ jsx(ArrowRight, {}),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Next slide" })
      ]
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
const ERROR_IMG_SRC = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";
function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const handleError = () => {
    setDidError(true);
  };
  const { src, alt, style, className, ...rest } = props;
  return didError ? /* @__PURE__ */ jsx(
    "div",
    {
      className: `inline-block bg-gray-100 text-center align-middle ${className ?? ""}`,
      style,
      children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-full h-full", children: /* @__PURE__ */ jsx("img", { src: ERROR_IMG_SRC, alt: "Error loading image", ...rest, "data-original-url": src }) })
    }
  ) : /* @__PURE__ */ jsx("img", { src, alt, className, style, ...rest, onError: handleError });
}
function RatingPill({
  rating
}) {
  return /* @__PURE__ */ jsxs("div", {
    className: "inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs text-white backdrop-blur",
    children: [/* @__PURE__ */ jsx(Star, {
      className: "h-3 w-3 fill-yellow-400 text-yellow-400"
    }), rating.toFixed(1)]
  });
}
function PublicMovieTile({
  movie
}) {
  return /* @__PURE__ */ jsxs("article", {
    className: "group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "relative aspect-[3/4] overflow-hidden bg-secondary",
      children: [/* @__PURE__ */ jsx(ImageWithFallback, {
        src: movie.posterUrl,
        alt: movie.title,
        className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      }), /* @__PURE__ */ jsx("div", {
        className: "absolute right-4 top-4",
        children: /* @__PURE__ */ jsx(RatingPill, {
          rating: movie.rating
        })
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "space-y-3 p-5",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h3", {
          className: "line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary",
          children: movie.title
        }), /* @__PURE__ */ jsxs("p", {
          className: "text-sm text-muted-foreground",
          children: ["Released ", movie.releaseYear]
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "line-clamp-4 text-sm text-muted-foreground",
        children: movie.synopsis
      })]
    })]
  });
}
function CollectionStrip({
  collection,
  isAuthenticated
}) {
  if (collection.movies.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs("section", {
    className: "space-y-5",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex items-end justify-between gap-4",
      children: [/* @__PURE__ */ jsxs("div", {
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-2xl font-bold",
          children: collection.title
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-1 text-muted-foreground",
          children: collection.description
        })]
      }), /* @__PURE__ */ jsx(Button, {
        asChild: true,
        variant: "outline",
        className: "hidden sm:inline-flex",
        children: /* @__PURE__ */ jsxs(Link, {
          to: isAuthenticated ? "/catalog" : "/login",
          children: ["Open app", /* @__PURE__ */ jsx(ArrowRight, {
            className: "h-4 w-4"
          })]
        })
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6",
      children: collection.movies.map((movie) => /* @__PURE__ */ jsx(PublicMovieTile, {
        movie
      }, `${collection.id}-${movie.id}`))
    })]
  });
}
function Landing() {
  const isAuthenticated = authService.isAuthenticated();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const loadLanding = async () => {
      try {
        const data = await landingService.getLandingPayload();
        setPayload(data);
        setHasError(false);
      } catch (error) {
        console.error("Failed to load landing payload:", error);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    loadLanding();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx("div", {
      className: "flex min-h-screen items-center justify-center bg-background",
      children: /* @__PURE__ */ jsx(Loader2, {
        className: "h-8 w-8 animate-spin text-primary"
      })
    });
  }
  if (hasError || !payload) {
    return /* @__PURE__ */ jsx("div", {
      className: "flex min-h-screen items-center justify-center bg-background px-4",
      children: /* @__PURE__ */ jsxs("div", {
        className: "max-w-md rounded-2xl border border-border bg-card p-8 text-center",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-2xl font-bold",
          children: "Landing unavailable"
        }), /* @__PURE__ */ jsx("p", {
          className: "mt-3 text-muted-foreground",
          children: "The TMDB discover feed could not be loaded from the backend. Try refreshing or open the app directly."
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-6 flex justify-center gap-3",
          children: [/* @__PURE__ */ jsx(Button, {
            asChild: true,
            children: /* @__PURE__ */ jsx(Link, {
              to: isAuthenticated ? "/home" : "/login",
              children: "Open app"
            })
          }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "outline",
            children: /* @__PURE__ */ jsx(Link, {
              to: "/",
              children: "Retry"
            })
          })]
        })]
      })
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen bg-background text-foreground",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(193,18,31,0.22),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(140,106,67,0.16),transparent_20%),linear-gradient(180deg,rgba(20,20,22,1),rgba(9,9,10,1))]",
      children: [/* @__PURE__ */ jsx("div", {
        className: "absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px]"
      }), /* @__PURE__ */ jsxs("header", {
        className: "relative mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsxs(Link, {
          to: "/",
          className: "flex items-center gap-3",
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25",
            children: /* @__PURE__ */ jsx(Film, {
              className: "h-6 w-6"
            })
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-lg font-semibold",
              children: "MovieVault"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs uppercase tracking-[0.24em] text-muted-foreground",
              children: "Showcase Edition"
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-3",
          children: [/* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "ghost",
            className: "hidden sm:inline-flex",
            children: /* @__PURE__ */ jsx(Link, {
              to: isAuthenticated ? "/home" : "/login",
              children: isAuthenticated ? "Open app" : "Sign in"
            })
          }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            className: "rounded-full px-5",
            children: /* @__PURE__ */ jsx(Link, {
              to: isAuthenticated ? "/home" : "/register",
              children: isAuthenticated ? "Go to dashboard" : "Create account"
            })
          })]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-12",
        children: [/* @__PURE__ */ jsxs("section", {
          className: "space-y-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary",
            children: [/* @__PURE__ */ jsx(Sparkles, {
              className: "h-4 w-4"
            }), "Live landing powered by the backend TMDB discover endpoint"]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-5",
            children: [/* @__PURE__ */ jsx("h1", {
              className: "max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl",
              children: "A storefront for cinema culture, now fed by real discover data."
            }), /* @__PURE__ */ jsx("p", {
              className: "max-w-2xl text-lg leading-8 text-muted-foreground",
              children: "The homepage now surfaces live titles from the backend discover feed and translates them into a cleaner showcase before users enter the app."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-3",
            children: [/* @__PURE__ */ jsx(Button, {
              asChild: true,
              size: "lg",
              className: "rounded-full px-6",
              children: /* @__PURE__ */ jsxs(Link, {
                to: isAuthenticated ? "/home" : "/login",
                children: [isAuthenticated ? "Enter MovieVault" : "Sign in to continue", /* @__PURE__ */ jsx(ArrowRight, {
                  className: "h-4 w-4"
                })]
              })
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              size: "lg",
              variant: "outline",
              className: "rounded-full px-6",
              children: /* @__PURE__ */ jsx(Link, {
                to: isAuthenticated ? "/catalog" : "/register",
                children: isAuthenticated ? "Browse catalog" : "Start with a free account"
              })
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "grid gap-4 sm:grid-cols-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "rounded-2xl border border-border bg-card/70 p-5 backdrop-blur",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Current page"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-2 text-3xl font-bold",
                children: payload.stats.currentPage
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-2xl border border-border bg-card/70 p-5 backdrop-blur",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Total pages"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-2 text-3xl font-bold",
                children: payload.stats.totalPages
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-2xl border border-border bg-card/70 p-5 backdrop-blur",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Total results"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-2 text-3xl font-bold",
                children: payload.stats.totalResults
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-2xl border border-border bg-card/70 p-5 backdrop-blur",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Avg. rating"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-2 text-3xl font-bold",
                children: payload.stats.averageRating
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("section", {
          className: "relative rounded-[2rem] border border-border bg-card/70 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-4 flex items-center justify-between gap-3",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm uppercase tracking-[0.24em] text-primary",
                children: "Featured Reel"
              }), /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold",
                children: "Backend discover showcase"
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "hidden items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground sm:flex",
              children: [/* @__PURE__ */ jsx(TrendingUp, {
                className: "h-3.5 w-3.5 text-primary"
              }), "Sorted by popularity.desc"]
            })]
          }), /* @__PURE__ */ jsxs(Carousel, {
            className: "w-full",
            children: [/* @__PURE__ */ jsx(CarouselContent, {
              children: payload.heroMovies.map((movie) => /* @__PURE__ */ jsx(CarouselItem, {
                children: /* @__PURE__ */ jsx("article", {
                  className: "overflow-hidden rounded-[1.5rem] border border-border bg-secondary/30 p-5 sm:p-6",
                  children: /* @__PURE__ */ jsxs("div", {
                    className: "grid gap-6 md:grid-cols-[220px_1fr] md:items-center",
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "overflow-hidden rounded-2xl border border-border bg-card",
                      children: /* @__PURE__ */ jsxs("div", {
                        className: "relative aspect-[3/4]",
                        children: [/* @__PURE__ */ jsx(ImageWithFallback, {
                          src: movie.posterUrl,
                          alt: movie.title,
                          className: "h-full w-full object-cover"
                        }), /* @__PURE__ */ jsx("div", {
                          className: "absolute right-4 top-4",
                          children: /* @__PURE__ */ jsx(RatingPill, {
                            rating: movie.rating
                          })
                        })]
                      })
                    }), /* @__PURE__ */ jsxs("div", {
                      className: "space-y-5",
                      children: [/* @__PURE__ */ jsxs("div", {
                        className: "flex flex-wrap gap-2",
                        children: [/* @__PURE__ */ jsx(Badge, {
                          className: "rounded-full bg-primary/15 text-primary hover:bg-primary/15",
                          children: "TMDB Discover"
                        }), /* @__PURE__ */ jsxs(Badge, {
                          variant: "outline",
                          className: "rounded-full",
                          children: ["Release ", movie.releaseYear]
                        })]
                      }), /* @__PURE__ */ jsxs("div", {
                        children: [/* @__PURE__ */ jsx("h3", {
                          className: "text-3xl font-bold sm:text-4xl",
                          children: movie.title
                        }), /* @__PURE__ */ jsx("p", {
                          className: "mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base",
                          children: movie.synopsis
                        })]
                      }), /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
                        children: [/* @__PURE__ */ jsxs("span", {
                          children: ["Release date: ", movie.releaseDate || "TBA"]
                        }), /* @__PURE__ */ jsxs("span", {
                          children: ["TMDB score: ", movie.rating.toFixed(1)]
                        })]
                      }), /* @__PURE__ */ jsxs("div", {
                        className: "flex flex-wrap gap-3",
                        children: [/* @__PURE__ */ jsx(Button, {
                          asChild: true,
                          children: /* @__PURE__ */ jsx(Link, {
                            to: isAuthenticated ? "/catalog" : "/login",
                            children: isAuthenticated ? "Open catalog" : "Sign in to explore"
                          })
                        }), /* @__PURE__ */ jsx(Button, {
                          asChild: true,
                          variant: "outline",
                          children: /* @__PURE__ */ jsx(Link, {
                            to: isAuthenticated ? "/home" : "/register",
                            children: isAuthenticated ? "Go to dashboard" : "Create account"
                          })
                        })]
                      })]
                    })]
                  })
                })
              }, movie.id))
            }), /* @__PURE__ */ jsx(CarouselPrevious, {
              className: "left-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-black/70 disabled:opacity-40"
            }), /* @__PURE__ */ jsx(CarouselNext, {
              className: "right-4 top-4 translate-y-0 border-white/15 bg-black/50 text-white hover:bg-black/70 disabled:opacity-40"
            })]
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs("main", {
      className: "mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 lg:px-8 lg:py-20",
      children: [/* @__PURE__ */ jsxs("section", {
        className: "grid gap-6 lg:grid-cols-[0.95fr_1.05fr]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "rounded-[2rem] border border-border bg-card p-7",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-6 flex items-center gap-3",
            children: [/* @__PURE__ */ jsx("div", {
              className: "rounded-2xl bg-primary/10 p-3 text-primary",
              children: /* @__PURE__ */ jsx(Clapperboard, {
                className: "h-6 w-6"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm uppercase tracking-[0.24em] text-primary",
                children: "Spotlight"
              }), /* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold",
                children: "A tighter discover cut"
              })]
            })]
          }), /* @__PURE__ */ jsx("p", {
            className: "max-w-xl text-muted-foreground",
            children: "The landing now uses the backend discover response directly and reshapes it into a public-facing showcase without inventing fields that the endpoint does not provide."
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "grid gap-6 sm:grid-cols-2",
          children: payload.spotlightMovies.map((movie) => /* @__PURE__ */ jsx(PublicMovieTile, {
            movie
          }, `spotlight-${movie.id}`))
        })]
      }), payload.collections.map((collection) => /* @__PURE__ */ jsx(CollectionStrip, {
        collection,
        isAuthenticated
      }, collection.id)), /* @__PURE__ */ jsx("section", {
        className: "rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10",
        children: /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "max-w-2xl",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-sm uppercase tracking-[0.24em] text-primary",
              children: "Ready to go further"
            }), /* @__PURE__ */ jsx("h2", {
              className: "mt-3 text-3xl font-bold sm:text-4xl",
              children: "The entry page now reflects real backend content."
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-4 text-lg text-muted-foreground",
              children: "Login, catalog, rankings and collection management can now sit behind a landing that is backed by live discover results instead of local placeholder content."
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-3",
            children: [/* @__PURE__ */ jsx(Button, {
              asChild: true,
              size: "lg",
              className: "rounded-full px-6",
              children: /* @__PURE__ */ jsxs(Link, {
                to: isAuthenticated ? "/home" : "/login",
                children: [/* @__PURE__ */ jsx(Play, {
                  className: "h-4 w-4"
                }), isAuthenticated ? "Open the app" : "Enter MovieVault"]
              })
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              size: "lg",
              variant: "outline",
              className: "rounded-full px-6",
              children: /* @__PURE__ */ jsx(Link, {
                to: isAuthenticated ? "/ranking" : "/register",
                children: "See what is inside"
              })
            })]
          })]
        })
      })]
    })]
  });
}
const Landing_default = UNSAFE_withComponentProps(Landing);
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Landing,
  default: Landing_default
}, Symbol.toStringTag, { value: "Module" }));
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login({
        email,
        password
      });
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex min-h-screen items-center justify-center p-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
    }), /* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%)]"
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col items-center gap-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary",
          children: /* @__PURE__ */ jsx(Film, {
            className: "h-10 w-10 text-primary-foreground"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-center",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Welcome to MovieVault"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-2",
            children: "Sign in to manage your cinema collection"
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "rounded-2xl border border-border bg-card p-8 shadow-xl",
        children: /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-6",
          children: [error && /* @__PURE__ */ jsx("div", {
            className: "rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive",
            children: error
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "email",
              children: "Email"
            }), /* @__PURE__ */ jsx(Input, {
              id: "email",
              type: "email",
              placeholder: "admin@mv.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "password",
                children: "Password"
              }), /* @__PURE__ */ jsx(Link, {
                to: "/reset-password",
                className: "text-sm text-primary hover:underline",
                children: "Forgot password?"
              })]
            }), /* @__PURE__ */ jsx(Input, {
              id: "password",
              type: "password",
              placeholder: "Enter your password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            className: "w-full h-11",
            disabled: loading,
            children: loading ? /* @__PURE__ */ jsxs(Fragment, {
              children: [/* @__PURE__ */ jsx(Loader2, {
                className: "mr-2 h-4 w-4 animate-spin"
              }), "Signing in..."]
            }) : "Sign in"
          }), /* @__PURE__ */ jsxs("div", {
            className: "rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm",
            children: [/* @__PURE__ */ jsx("p", {
              className: "font-medium text-primary mb-1",
              children: "Example Credentials:"
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-muted-foreground",
              children: ["Email: ", /* @__PURE__ */ jsx("span", {
                className: "text-foreground",
                children: "admin@mv.com"
              }), /* @__PURE__ */ jsx("br", {}), "Password: ", /* @__PURE__ */ jsx("span", {
                className: "text-foreground",
                children: "123Mv'"
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("p", {
        className: "text-center text-sm text-muted-foreground",
        children: ["Don't have an account?", " ", /* @__PURE__ */ jsx(Link, {
          to: "/register",
          className: "text-primary hover:underline font-medium",
          children: "Create one now"
        })]
      })]
    })]
  });
}
const Login_default = UNSAFE_withComponentProps(Login);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Login,
  default: Login_default
}, Symbol.toStringTag, { value: "Module" }));
function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        name,
        email,
        password
      });
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex min-h-screen items-center justify-center p-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
    }), /* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]"
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col items-center gap-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary",
          children: /* @__PURE__ */ jsx(Film, {
            className: "h-10 w-10 text-primary-foreground"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-center",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Join MovieVault"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-2",
            children: "Start building your cinema collection today"
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "rounded-2xl border border-border bg-card p-8 shadow-xl",
        children: /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-5",
          children: [error && /* @__PURE__ */ jsx("div", {
            className: "rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive",
            children: error
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "name",
              children: "Full Name"
            }), /* @__PURE__ */ jsx(Input, {
              id: "name",
              type: "text",
              placeholder: "John Doe",
              value: name,
              onChange: (e) => setName(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "email",
              children: "Email"
            }), /* @__PURE__ */ jsx(Input, {
              id: "email",
              type: "email",
              placeholder: "you@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "password",
              children: "Password"
            }), /* @__PURE__ */ jsx(Input, {
              id: "password",
              type: "password",
              placeholder: "At least 6 characters",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "confirmPassword",
              children: "Confirm Password"
            }), /* @__PURE__ */ jsx(Input, {
              id: "confirmPassword",
              type: "password",
              placeholder: "Repeat your password",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              required: true,
              className: "h-11"
            })]
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            className: "w-full h-11",
            disabled: loading,
            children: loading ? /* @__PURE__ */ jsxs(Fragment, {
              children: [/* @__PURE__ */ jsx(Loader2, {
                className: "mr-2 h-4 w-4 animate-spin"
              }), "Creating account..."]
            }) : "Create account"
          })]
        })
      }), /* @__PURE__ */ jsxs("p", {
        className: "text-center text-sm text-muted-foreground",
        children: ["Already have an account?", " ", /* @__PURE__ */ jsx(Link, {
          to: "/login",
          className: "text-primary hover:underline font-medium",
          children: "Sign in"
        })]
      })]
    })]
  });
}
const Register_default = UNSAFE_withComponentProps(Register);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Register,
  default: Register_default
}, Symbol.toStringTag, { value: "Module" }));
function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex min-h-screen items-center justify-center p-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background"
    }), /* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"
    }), /* @__PURE__ */ jsxs("div", {
      className: "w-full max-w-md space-y-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col items-center gap-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary",
          children: /* @__PURE__ */ jsx(Film, {
            className: "h-10 w-10 text-primary-foreground"
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-center",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Reset Password"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground mt-2",
            children: success ? "Check your email for reset instructions" : "Enter your email to receive reset instructions"
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "rounded-2xl border border-border bg-card p-8 shadow-xl",
        children: success ? /* @__PURE__ */ jsxs("div", {
          className: "space-y-6 text-center",
          children: [/* @__PURE__ */ jsx("div", {
            className: "flex justify-center",
            children: /* @__PURE__ */ jsx("div", {
              className: "flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10",
              children: /* @__PURE__ */ jsx(CheckCircle2, {
                className: "h-8 w-8 text-green-500"
              })
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "font-semibold",
              children: "Email Sent!"
            }), /* @__PURE__ */ jsxs("p", {
              className: "text-sm text-muted-foreground",
              children: ["We've sent password reset instructions to ", /* @__PURE__ */ jsx("span", {
                className: "text-foreground font-medium",
                children: email
              }), ". Please check your inbox and follow the link to reset your password."]
            })]
          }), /* @__PURE__ */ jsx(Button, {
            asChild: true,
            className: "w-full",
            children: /* @__PURE__ */ jsx(Link, {
              to: "/login",
              children: "Back to Sign in"
            })
          })]
        }) : /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-6",
          children: [error && /* @__PURE__ */ jsx("div", {
            className: "rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive",
            children: error
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: "email",
              children: "Email Address"
            }), /* @__PURE__ */ jsx(Input, {
              id: "email",
              type: "email",
              placeholder: "you@example.com",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              className: "h-11"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs text-muted-foreground",
              children: "Enter the email address associated with your account"
            })]
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            className: "w-full h-11",
            disabled: loading,
            children: loading ? /* @__PURE__ */ jsxs(Fragment, {
              children: [/* @__PURE__ */ jsx(Loader2, {
                className: "mr-2 h-4 w-4 animate-spin"
              }), "Sending..."]
            }) : "Send Reset Instructions"
          })]
        })
      }), !success && /* @__PURE__ */ jsxs("p", {
        className: "text-center text-sm text-muted-foreground",
        children: ["Remember your password?", " ", /* @__PURE__ */ jsx(Link, {
          to: "/login",
          className: "text-primary hover:underline font-medium",
          children: "Sign in"
        })]
      })]
    })]
  });
}
const ResetPassword_default = UNSAFE_withComponentProps(ResetPassword);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ResetPassword,
  default: ResetPassword_default
}, Symbol.toStringTag, { value: "Module" }));
const ProtectedRouteLayout = UNSAFE_withComponentProps(function ProtectedRouteLayout2() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    let active = true;
    const verifyAccess = async () => {
      const authenticated = await authService.ensureAuthenticated();
      const user = authService.getCurrentUser();
      if (!active) {
        return;
      }
      setStatus(authenticated && user ? "allowed" : "denied");
    };
    void verifyAccess();
    return () => {
      active = false;
    };
  }, []);
  if (status === "checking") {
    return /* @__PURE__ */ jsx("div", {
      className: "flex min-h-screen items-center justify-center bg-background",
      children: /* @__PURE__ */ jsx(Loader2, {
        className: "h-8 w-8 animate-spin text-primary"
      })
    });
  }
  if (status === "denied") {
    return /* @__PURE__ */ jsx(Navigate, {
      to: "/login",
      replace: true
    });
  }
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProtectedRouteLayout
}, Symbol.toStringTag, { value: "Module" }));
const MOCK_BADGES = [
  {
    id: "b1",
    name: "Cinephile",
    description: "Watch 100 movies",
    icon: "🎬",
    rarity: "rare"
  },
  {
    id: "b2",
    name: "Critic",
    description: "Write 50 reviews",
    icon: "✍️",
    rarity: "epic"
  },
  {
    id: "b3",
    name: "Early Adopter",
    description: "Join in the first month",
    icon: "⭐",
    rarity: "legendary"
  },
  {
    id: "b4",
    name: "Genre Master",
    description: "Complete all genres",
    icon: "🏆",
    rarity: "epic"
  },
  {
    id: "b5",
    name: "Collector",
    description: "Add 50 movies to collection",
    icon: "📚",
    rarity: "rare"
  }
];
function buildRankingHeaders() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : void 0;
}
function fallbackUsername(userId) {
  const currentUser = getStoredUser();
  if ((currentUser == null ? void 0 : currentUser.id) === userId) {
    return currentUser.name;
  }
  return `User ${userId.slice(0, 8)}`;
}
function mapUserScore(dto, requestedUserId) {
  const currentUser = getStoredUser();
  const resolvedUserId = dto.user_id || requestedUserId;
  const totalScore = dto.total_score ?? dto.score ?? 0;
  return {
    userId: resolvedUserId,
    username: (currentUser == null ? void 0 : currentUser.id) === resolvedUserId ? currentUser.name : fallbackUsername(resolvedUserId),
    avatar: (currentUser == null ? void 0 : currentUser.id) === resolvedUserId ? currentUser.avatar : void 0,
    totalScore,
    level: rankingService.calculateLevel(totalScore),
    moviesWatched: dto.distinct_owned_count ?? dto.collection_size ?? 0,
    reviewsWritten: 0,
    rank: dto.rank ?? 0,
    badges: []
  };
}
function mapLeaderboardEntry(dto) {
  const currentUser = getStoredUser();
  return {
    userId: dto.user_id,
    username: (currentUser == null ? void 0 : currentUser.id) === dto.user_id ? currentUser.name : fallbackUsername(dto.user_id),
    avatar: (currentUser == null ? void 0 : currentUser.id) === dto.user_id ? currentUser.avatar : void 0,
    score: dto.score,
    rank: dto.rank,
    change: 0
  };
}
const rankingService = {
  async getUserScore(userId) {
    const response = await apiFetch(`/api/ranking/users/${userId}/score`, {
      auth: "required",
      headers: buildRankingHeaders()
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok || !(payload == null ? void 0 : payload.data)) {
      throw new Error(`Failed to load ranking score (${response.status})`);
    }
    return mapUserScore(payload.data, userId);
  },
  async getLeaderboard(limit = 10) {
    const response = await apiFetch(`/api/ranking/leaderboard?limit=${limit}`, {
      auth: "required",
      headers: buildRankingHeaders()
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok || !(payload == null ? void 0 : payload.data)) {
      throw new Error(`Failed to load leaderboard (${response.status})`);
    }
    return payload.data.entries.map(mapLeaderboardEntry);
  },
  async getAllBadges() {
    return MOCK_BADGES;
  },
  calculateLevel(score) {
    return Math.floor(score / 500) + 1;
  },
  getNextLevelProgress(score) {
    const current = this.calculateLevel(score);
    const currentLevelScore = (current - 1) * 500;
    const progress = score - currentLevelScore;
    const percentage = progress / 500 * 100;
    return {
      current,
      next: current + 1,
      percentage: Math.min(percentage, 100)
    };
  }
};
const DEFAULT_IA_SERVICE_BASE_URL = "http://localhost:8080";
const IA_MODEL_LABEL = "Gemini 2.5 Flash";
function getIaServiceBaseUrl() {
  const configuredBaseUrl = void 0;
  return configuredBaseUrl || DEFAULT_IA_SERVICE_BASE_URL;
}
function buildIaServiceUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getIaServiceBaseUrl()}${normalizedPath}`;
}
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function calculateReadTime(content) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}
function buildTags(article) {
  const tags = ["AI Editorial"];
  if (article.editionId) {
    tags.push("Edition Created");
  }
  return tags;
}
function mapArticle(article) {
  const excerpt = stripHtml(article.content).slice(0, 220).trim();
  return {
    id: String(article.id),
    slug: article.slug,
    title: article.title,
    content: article.content,
    excerpt,
    imageUrl: article.imageUrl ?? "",
    productUrl: article.productUrl ?? "",
    filmId: article.filmId,
    editionId: article.editionId,
    model: IA_MODEL_LABEL,
    generatedAt: article.createdAt,
    readTime: calculateReadTime(article.content),
    tags: buildTags(article)
  };
}
async function fetchIa(path) {
  const response = await fetch(buildIaServiceUrl(path), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `IA request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }
  return payload;
}
const iaService = {
  async getArticlesByMovieId(movieId) {
    const payload = await fetchIa(`/api/blog/film/${encodeURIComponent(movieId)}`);
    return ((payload == null ? void 0 : payload.data) ?? []).map(mapArticle);
  },
  async getArticleById(id) {
    const payload = await fetchIa(`/api/blog/${encodeURIComponent(id)}`);
    return (payload == null ? void 0 : payload.data) ? mapArticle(payload.data) : null;
  },
  async getArticleBySlug(slug) {
    const payload = await fetchIa(`/api/blog/slug/${encodeURIComponent(slug)}`);
    return (payload == null ? void 0 : payload.data) ? mapArticle(payload.data) : null;
  },
  async getAllArticles() {
    const payload = await fetchIa("/api/blog");
    return ((payload == null ? void 0 : payload.data) ?? []).map(mapArticle);
  }
};
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DropdownMenuPrimitive.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Root,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Image,
    {
      "data-slot": "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AvatarPrimitive.Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };
  if (!user) return null;
  return /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/home", className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary", children: /* @__PURE__ */ jsx(Film, { className: "h-6 w-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold leading-none", children: "MovieVault" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Your Cinema Collection" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-6", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/catalog",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "Catalog"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/collection",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "My Collection"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/ai-content",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "AI Insights"
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/ranking",
          className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
          children: "Leaderboard"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(DropdownMenu, { children: [
      /* @__PURE__ */ jsx(DropdownMenuTrigger, { className: "focus:outline-none", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-full border border-border bg-secondary/50 py-1.5 pl-1.5 pr-4 hover:bg-secondary transition-colors", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: user.avatar, alt: user.name }),
          /* @__PURE__ */ jsx(AvatarFallback, { children: user.name.charAt(0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex flex-col items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-none", children: user.name }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: user.role })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-2 py-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: user.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: user.email })
        ] }),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => navigate("/ranking"), children: [
          /* @__PURE__ */ jsx(Trophy, { className: "mr-2 h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { children: "My Ranking" })
        ] }),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => navigate("/settings"), children: [
          /* @__PURE__ */ jsx(Settings$1, { className: "mr-2 h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { children: "Settings" })
        ] }),
        /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleLogout, children: [
          /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { children: "Logout" })
        ] })
      ] })
    ] })
  ] }) }) });
}
function AIArticleBlock({ article, compact = false, href }) {
  const getModelColor = () => {
    switch (article.model) {
      case "Gemini 2.5 Flash":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Gemini Pro":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "GPT-4":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Claude 3":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };
  if (compact) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        to: href ?? `/ai-content/${article.slug}`,
        className: "group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 font-semibold transition-colors group-hover:text-primary", children: article.title }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: getModelColor(), children: article.model }),
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                  article.readTime,
                  " min read"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "line-clamp-3 text-sm text-muted-foreground", children: article.excerpt }),
          article.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: article.tags.slice(0, 3).map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag)) })
        ] })
      }
    );
  }
  return /* @__PURE__ */ jsxs("article", { className: "overflow-hidden rounded-xl border border-border bg-card", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b border-border bg-secondary/30 px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: article.title }),
        /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: getModelColor(), children: article.model }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
            article.readTime,
            " min read"
          ] }),
          /* @__PURE__ */ jsx("span", { children: new Date(article.generatedAt).toLocaleDateString() })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "prose prose-invert max-w-none px-6 py-6 prose-sm", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "leading-relaxed text-muted-foreground",
        dangerouslySetInnerHTML: { __html: article.content }
      }
    ) }),
    article.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "border-t border-border px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: article.tags.map((tag) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: tag }, tag)) })
    ] }) })
  ] });
}
function DiscoverShowcaseCard({
  movie
}) {
  return /* @__PURE__ */ jsx("article", {
    className: "overflow-hidden rounded-[1.5rem] border border-border bg-card",
    children: /* @__PURE__ */ jsxs("div", {
      className: "grid gap-0 lg:grid-cols-[240px_1fr]",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "relative aspect-[3/4] overflow-hidden bg-secondary lg:aspect-auto",
        children: [/* @__PURE__ */ jsx(ImageWithFallback, {
          src: movie.posterUrl,
          alt: movie.title,
          className: "h-full w-full object-cover"
        }), /* @__PURE__ */ jsxs("div", {
          className: "absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-xs text-white backdrop-blur",
          children: [/* @__PURE__ */ jsx(Star, {
            className: "h-3 w-3 fill-yellow-400 text-yellow-400"
          }), movie.rating.toFixed(1)]
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-5 p-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap gap-2",
          children: [/* @__PURE__ */ jsx(Badge, {
            className: "bg-primary/15 text-primary hover:bg-primary/15",
            children: "Public discover"
          }), /* @__PURE__ */ jsxs(Badge, {
            variant: "outline",
            children: ["Release ", movie.releaseYear]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-3xl font-bold",
            children: movie.title
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-3 line-clamp-5 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base",
            children: movie.synopsis
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
          children: [/* @__PURE__ */ jsxs("span", {
            children: ["Release date: ", movie.releaseDate || "TBA"]
          }), /* @__PURE__ */ jsxs("span", {
            children: ["TMDB score: ", movie.rating.toFixed(1)]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "flex flex-wrap gap-3",
          children: /* @__PURE__ */ jsx(Button, {
            asChild: true,
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/catalog",
              children: ["Open catalog", /* @__PURE__ */ jsx(ArrowRight, {
                className: "h-4 w-4"
              })]
            })
          })
        })]
      })]
    })
  });
}
function Home() {
  const user = authService.getCurrentUser();
  const userId = (user == null ? void 0 : user.id) || "1";
  const [discoverMovies, setDiscoverMovies] = useState([]);
  const [userScore, setUserScore] = useState(null);
  const [aiArticles, setAiArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [movies, score, articles] = await Promise.all([landingService.getDiscoverMovies({
          page: 1,
          sortBy: "popularity.desc"
        }), rankingService.getUserScore(userId), iaService.getAllArticles()]);
        setDiscoverMovies(movies.slice(0, 6));
        setUserScore(score);
        setAiArticles(articles.slice(0, 3));
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);
  if (loading) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
        className: "flex items-center justify-center min-h-[60vh]",
        children: /* @__PURE__ */ jsx(Loader2, {
          className: "h-8 w-8 animate-spin text-primary"
        })
      })]
    });
  }
  const levelProgress = userScore ? rankingService.getNextLevelProgress(userScore.totalScore) : null;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "relative overflow-hidden border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_45%,rgba(9,9,10,1))]",
        children: [/* @__PURE__ */ jsx("div", {
          className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(140,106,67,0.18),transparent_42%)]"
        }), /* @__PURE__ */ jsx("div", {
          className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-6",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary",
              children: [/* @__PURE__ */ jsx(Sparkles, {
                className: "h-4 w-4"
              }), "Welcome back, ", user == null ? void 0 : user.name]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-4xl sm:text-5xl font-bold mb-3",
                children: "Your Cinema Universe"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-lg text-muted-foreground max-w-2xl",
                children: "Explore, collect, and discover movies enriched with AI-generated insights. Track your journey and compete with fellow cinephiles."
              })]
            }), userScore && /* @__PURE__ */ jsxs("div", {
              className: "grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl pt-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "rounded-xl border border-border bg-card p-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2 text-muted-foreground mb-1",
                  children: [/* @__PURE__ */ jsx(TrendingUp, {
                    className: "h-4 w-4"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-sm",
                    children: "Level"
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-2xl font-bold",
                  children: userScore.level
                }), levelProgress && /* @__PURE__ */ jsxs("p", {
                  className: "text-xs text-muted-foreground mt-1",
                  children: [levelProgress.percentage.toFixed(0), "% to next"]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "rounded-xl border border-border bg-card p-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2 text-muted-foreground mb-1",
                  children: [/* @__PURE__ */ jsx(Film, {
                    className: "h-4 w-4"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-sm",
                    children: "Movies"
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-2xl font-bold",
                  children: userScore.moviesWatched
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-muted-foreground mt-1",
                  children: "watched"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "rounded-xl border border-border bg-card p-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2 text-muted-foreground mb-1",
                  children: [/* @__PURE__ */ jsx(Brain, {
                    className: "h-4 w-4"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-sm",
                    children: "Reviews"
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-2xl font-bold",
                  children: userScore.reviewsWritten
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-muted-foreground mt-1",
                  children: "written"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "rounded-xl border border-border bg-card p-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center gap-2 text-muted-foreground mb-1",
                  children: [/* @__PURE__ */ jsx(TrendingUp, {
                    className: "h-4 w-4"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-sm",
                    children: "Rank"
                  })]
                }), /* @__PURE__ */ jsxs("p", {
                  className: "text-2xl font-bold",
                  children: ["#", userScore.rank]
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-xs text-muted-foreground mt-1",
                  children: "global"
                })]
              })]
            })]
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16",
        children: [/* @__PURE__ */ jsxs("section", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-6",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold",
                children: "Discover Showcase"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground mt-1",
                children: "Live titles coming from the public discover endpoint"
              })]
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              variant: "outline",
              children: /* @__PURE__ */ jsxs(Link, {
                to: "/catalog",
                children: ["Open Catalog", /* @__PURE__ */ jsx(ArrowRight, {
                  className: "ml-2 h-4 w-4"
                })]
              })
            })]
          }), discoverMovies.length > 0 ? /* @__PURE__ */ jsxs(Carousel, {
            className: "w-full",
            children: [/* @__PURE__ */ jsx(CarouselContent, {
              children: discoverMovies.map((movie) => /* @__PURE__ */ jsx(CarouselItem, {
                children: /* @__PURE__ */ jsx(DiscoverShowcaseCard, {
                  movie
                })
              }, movie.id))
            }), /* @__PURE__ */ jsx(CarouselPrevious, {
              className: "left-4 top-4 translate-y-0"
            }), /* @__PURE__ */ jsx(CarouselNext, {
              className: "right-4 top-4 translate-y-0"
            })]
          }) : /* @__PURE__ */ jsx("div", {
            className: "rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground",
            children: "The discover feed is empty right now."
          })]
        }), /* @__PURE__ */ jsxs("section", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-6",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-2xl font-bold",
                children: "AI-Generated Insights"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground mt-1",
                children: "Deep dives powered by artificial intelligence"
              })]
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              variant: "outline",
              children: /* @__PURE__ */ jsxs(Link, {
                to: "/ai-content",
                children: ["View All", /* @__PURE__ */ jsx(ArrowRight, {
                  className: "ml-2 h-4 w-4"
                })]
              })
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
            children: aiArticles.map((article) => /* @__PURE__ */ jsx(AIArticleBlock, {
              article,
              compact: true,
              href: `/ai-content/${article.slug}`
            }, article.id))
          })]
        }), /* @__PURE__ */ jsxs("section", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-6",
          children: [/* @__PURE__ */ jsx(Link, {
            to: "/catalog",
            className: "group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/5 p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
            children: /* @__PURE__ */ jsxs("div", {
              className: "relative z-10",
              children: [/* @__PURE__ */ jsx(Film, {
                className: "h-12 w-12 text-primary mb-4"
              }), /* @__PURE__ */ jsx("h3", {
                className: "text-xl font-bold mb-2",
                children: "Explore Catalog"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground",
                children: "Browse our extensive collection of movies from all genres and eras"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 flex items-center gap-2 text-primary font-medium",
                children: ["Start exploring", /* @__PURE__ */ jsx(ArrowRight, {
                  className: "h-4 w-4 transition-transform group-hover:translate-x-1"
                })]
              })]
            })
          }), /* @__PURE__ */ jsx(Link, {
            to: "/ranking",
            className: "group relative overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,rgba(140,106,67,0.22),rgba(111,29,27,0.08))] p-8 transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10",
            children: /* @__PURE__ */ jsxs("div", {
              className: "relative z-10",
              children: [/* @__PURE__ */ jsx(TrendingUp, {
                className: "mb-4 h-12 w-12 text-[#8c6a43]"
              }), /* @__PURE__ */ jsx("h3", {
                className: "text-xl font-bold mb-2",
                children: "Leaderboard"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground",
                children: "See how you rank against other movie enthusiasts worldwide"
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-4 flex items-center gap-2 text-blue-500 font-medium",
                children: ["View rankings", /* @__PURE__ */ jsx(ArrowRight, {
                  className: "h-4 w-4 transition-transform group-hover:translate-x-1"
                })]
              })]
            })
          })]
        })]
      })]
    })]
  });
}
const Home_default = UNSAFE_withComponentProps(Home);
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Home,
  default: Home_default
}, Symbol.toStringTag, { value: "Module" }));
function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search movies, directors, genres...",
  className = ""
}) {
  const [isFocused, setIsFocused] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch == null ? void 0 : onSearch(value);
  };
  const handleClear = () => {
    onChange("");
    onSearch == null ? void 0 : onSearch("");
  };
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative flex items-center rounded-xl border bg-card transition-all ${isFocused ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`,
      children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-4 h-5 w-5 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            value,
            onChange: (e) => onChange(e.target.value),
            onFocus: () => setIsFocused(true),
            onBlur: () => setIsFocused(false),
            placeholder,
            className: "h-12 border-0 bg-transparent pl-12 pr-24 focus-visible:ring-0 focus-visible:ring-offset-0"
          }
        ),
        value && /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: handleClear,
            className: "absolute right-16 h-7 w-7 p-0",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            size: "sm",
            className: "absolute right-2 rounded-lg",
            children: "Search"
          }
        )
      ]
    }
  ) });
}
function CatalogSearchCard({ item }) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      to: `/releases/${item.slug}`,
      state: { editionId: item.id },
      className: "group block",
      children: /* @__PURE__ */ jsxs("article", { className: "overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[2/3] overflow-hidden bg-secondary", children: [
          /* @__PURE__ */ jsx(
            ImageWithFallback,
            {
              src: item.coverPicture,
              alt: item.title,
              className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "line-clamp-2 font-semibold transition-colors group-hover:text-primary", children: item.title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: item.country || "Unknown country" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
            item.format && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: item.format }),
            item.packagingType && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: item.packagingType })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: item.releaseYear || "Year N/A" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Package2, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: item.slug })
            ] }),
            item.barCode && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(ScanLine, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: item.barCode })
            ] })
          ] })
        ] })
      ] })
    }
  );
}
function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  const { protocol, hostname, port, origin } = window.location;
  if ((hostname === "localhost" || hostname === "127.0.0.1") && port === "5173") {
    return `${protocol}//${hostname}`;
  }
  return origin;
}
function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_SEARCH_ENDPOINT = "/api/catalog/films/tmdb/search";
const CREATE_FILM_ENDPOINT = "/api/catalog/films";
const CREATE_RELEASE_ENDPOINT = "/api/catalog/edition";
const EDITION_IDENTITY_CACHE_KEY = "movievault_catalog_edition_identity_cache";
const PACKAGING_TYPE_OPTIONS = [
  "Amaray",
  "Slipcase",
  "Steelbook",
  "Digipak",
  "Mediabook",
  "Box_set"
];
const FORMAT_OPTIONS = [
  "DVD",
  "BluRay",
  "UHD_4K",
  "VHS",
  "Laser_Disc",
  "HDDVD",
  "Betamax"
];
function mapCatalogSearchItem(item) {
  return {
    id: item.id,
    filmId: item.film_id,
    slug: item.slug,
    title: item.film_title,
    coverPicture: mapCatalogCoverPicture(item.slug, item.cover_picture),
    barCode: item.bar_code,
    country: item.country,
    format: item.format,
    releaseYear: item.release_year,
    packagingType: item.packaging_type,
    notes: item.notes,
    searchableText: item.searchable_text,
    indexedAt: item.indexed_at
  };
}
function getEditionIdentityCache() {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const rawCache = window.sessionStorage.getItem(EDITION_IDENTITY_CACHE_KEY);
    return rawCache ? JSON.parse(rawCache) : {};
  } catch {
    return {};
  }
}
function persistEditionIdentity(slug, editionId) {
  if (typeof window === "undefined") {
    return;
  }
  const normalizedSlug = slug.trim();
  const normalizedEditionId = editionId.trim();
  if (!normalizedSlug || !normalizedEditionId) {
    return;
  }
  const nextCache = {
    ...getEditionIdentityCache(),
    [normalizedSlug]: normalizedEditionId
  };
  window.sessionStorage.setItem(EDITION_IDENTITY_CACHE_KEY, JSON.stringify(nextCache));
}
function mapCatalogCoverPicture(slug, coverPicture) {
  const normalizedSlug = slug.trim();
  const normalizedCoverPicture = (coverPicture == null ? void 0 : coverPicture.trim()) ?? "";
  if (!normalizedSlug || !normalizedCoverPicture) {
    return "";
  }
  return buildApiUrl(`/static/images/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(normalizedCoverPicture)}.jpeg`);
}
function mapEditionPictureUrl(slug, pictureId) {
  const normalizedSlug = slug.trim();
  const normalizedPictureId = pictureId.trim();
  if (!normalizedSlug || !normalizedPictureId) {
    return "";
  }
  return buildApiUrl(`/static/images/${encodeURIComponent(normalizedSlug)}/${encodeURIComponent(normalizedPictureId)}.jpeg`);
}
function mapEditionDetail(item) {
  var _a, _b, _c, _d;
  persistEditionIdentity(item.slug, item.id);
  const pictures = item.pictures.map((picture) => ({
    id: picture.id,
    url: mapEditionPictureUrl(item.slug, picture.id),
    uploadedAt: picture.uploadedAt
  }));
  const coverPictureId = ((_a = item.cover_picture) == null ? void 0 : _a.trim()) ?? "";
  const coverPictureUrl = ((_b = pictures.find((picture) => picture.id === coverPictureId)) == null ? void 0 : _b.url) ?? ((_c = pictures[0]) == null ? void 0 : _c.url) ?? "";
  return {
    id: item.id,
    filmId: item.film_id,
    slug: item.slug,
    barcode: item.barcode,
    country: item.country,
    format: item.format,
    releaseYear: ((_d = item.release_year) == null ? void 0 : _d.value) ?? 0,
    packagingType: item.packaging_type,
    verified: item.verified,
    coverPictureId,
    coverPictureUrl,
    notes: item.notes,
    pictures
  };
}
function mapTmdbSearchMovie(movie) {
  return {
    id: String(movie.id),
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : "",
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : "TBA",
    rating: movie.vote_average
  };
}
function getCreatedReleaseId(payload) {
  var _a, _b;
  return ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.id) ?? ((_b = payload == null ? void 0 : payload.data) == null ? void 0 : _b.editionId) ?? (payload == null ? void 0 : payload.id) ?? (payload == null ? void 0 : payload.editionId) ?? null;
}
function getUploadedEditionPictureId(payload) {
  var _a, _b;
  return ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.id) ?? ((_b = payload == null ? void 0 : payload.data) == null ? void 0 : _b.pictureId) ?? (payload == null ? void 0 : payload.id) ?? (payload == null ? void 0 : payload.pictureId) ?? null;
}
const catalogService = {
  async search(query, page = 0, size = 10) {
    var _a;
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return {
        elements: [],
        page: 0,
        size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
        nextPage: null,
        prevPage: null
      };
    }
    const params = new URLSearchParams({
      query: normalizedQuery,
      page: String(page),
      size: String(size)
    });
    const response = await apiFetch(`/api/catalog/elastic/search?${params.toString()}`, {
      method: "GET",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Catalog search failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.elements)) {
      throw new Error("Invalid catalog search response");
    }
    payload.data.elements.forEach((item) => {
      persistEditionIdentity(item.slug, item.id);
    });
    return {
      elements: payload.data.elements.map(mapCatalogSearchItem),
      page: payload.data.page,
      size: payload.data.size,
      totalElements: payload.data.total_elements,
      totalPages: payload.data.total_pages,
      hasNext: payload.data.has_next,
      hasPrevious: payload.data.has_previous,
      nextPage: payload.data.next_page,
      prevPage: payload.data.prev_page
    };
  },
  async searchTmdbMovie(query, page = 1) {
    var _a;
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return {
        page: 1,
        totalPages: 0,
        totalResults: 0,
        results: []
      };
    }
    const requestBody = {
      query: normalizedQuery,
      includeAdult: true,
      page
    };
    const response = await apiFetch(TMDB_SEARCH_ENDPOINT, {
      method: "POST",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `TMDB search failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.results)) {
      throw new Error("Invalid TMDB search response");
    }
    return {
      page: payload.data.page,
      totalPages: payload.data.total_pages,
      totalResults: payload.data.total_results,
      results: payload.data.results.map(mapTmdbSearchMovie)
    };
  },
  async createFilmFromTmdb(movie, producingCountry) {
    var _a;
    const requestBody = {
      tmdbId: movie.tmdbId,
      title: movie.title,
      description: movie.overview,
      releaseYear: Number(movie.releaseYear) || 0,
      producingCountry,
      rating: movie.rating.toFixed(1),
      poster: movie.posterPath ?? ""
    };
    const response = await apiFetch(CREATE_FILM_ENDPOINT, {
      method: "POST",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Film creation failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.id)) {
      throw new Error("Invalid film creation response");
    }
    return payload.data;
  },
  async createRelease(request) {
    const response = await apiFetch(CREATE_RELEASE_ENDPOINT, {
      method: "POST",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Release creation failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    const releaseId = getCreatedReleaseId(payload);
    if (!releaseId) {
      throw new Error("Invalid release creation response");
    }
    return {
      id: releaseId
    };
  },
  async uploadEditionPicture(editionId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiFetch(`/api/catalog/edition/${editionId}/pictures`, {
      method: "POST",
      auth: "required",
      body: formData
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Edition picture upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    const pictureId = getUploadedEditionPictureId(payload);
    if (!pictureId) {
      throw new Error("Invalid edition picture upload response");
    }
    return {
      id: pictureId
    };
  },
  async setEditionCoverPicture(editionId, pictureId) {
    const response = await apiFetch(`/api/catalog/edition/${editionId}/cover/${pictureId}`, {
      method: "PUT",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Edition cover assignment failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
  },
  getEditionIdBySlug(slug) {
    const normalizedSlug = slug.trim();
    if (!normalizedSlug) {
      return null;
    }
    return getEditionIdentityCache()[normalizedSlug] ?? null;
  },
  rememberEditionIdentity(slug, editionId) {
    persistEditionIdentity(slug, editionId);
  },
  async getEditionById(editionId) {
    var _a;
    const response = await apiFetch(`/api/catalog/edition/${editionId}`, {
      method: "GET",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await parseJsonSafely(response);
    if (!response.ok) {
      const errorMessage = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? `Edition detail failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.id)) {
      throw new Error("Invalid edition detail response");
    }
    return mapEditionDetail(payload.data);
  }
};
function Catalog() {
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [error, setError] = useState("");
  const runSearch = async (query, page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await catalogService.search(query, page, 10);
      setSearchResult(result);
      setActiveQuery(query.trim());
    } catch (searchError) {
      console.error("Failed to search catalog:", searchError);
      setError(searchError instanceof Error ? searchError.message : "Catalog search failed");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (query) => {
    runSearch(query, 0);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
    setSearchResult(null);
    setError("");
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-card/50 backdrop-blur",
        children: /* @__PURE__ */ jsx("div", {
          className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold",
                children: "Movie Catalog"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-muted-foreground",
                children: "Search the indexed catalog through the backend Elastic endpoint"
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "rounded-2xl border border-primary/20 bg-primary/10 p-4",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                children: [/* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("p", {
                    className: "font-medium text-foreground",
                    children: "Can't find the release you need?"
                  }), /* @__PURE__ */ jsx("p", {
                    className: "mt-1 text-sm text-muted-foreground",
                    children: "Search existing releases here, or start the release creation flow from a TMDB film search."
                  })]
                }), /* @__PURE__ */ jsx(Button, {
                  asChild: true,
                  children: /* @__PURE__ */ jsx(Link, {
                    to: "/catalog/releases/new",
                    children: "Add it"
                  })
                })]
              })
            }), /* @__PURE__ */ jsx(SearchBar, {
              value: searchQuery,
              onChange: setSearchQuery,
              onSearch: handleSearch,
              className: "max-w-2xl",
              placeholder: "Search titles in the catalog..."
            }), /* @__PURE__ */ jsx("div", {
              className: "flex flex-wrap items-center gap-3",
              children: activeQuery ? /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary",
                  children: ["Query: ", activeQuery]
                }), searchResult && /* @__PURE__ */ jsxs("div", {
                  className: "rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground",
                  children: [searchResult.totalElements.toLocaleString("en-US"), " results"]
                }), /* @__PURE__ */ jsx(Button, {
                  variant: "ghost",
                  size: "sm",
                  onClick: clearSearch,
                  children: "Clear search"
                })]
              }) : /* @__PURE__ */ jsx("div", {
                className: "rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground",
                children: "Use the search bar to query `/api/catalog/elastic/search`"
              })
            })]
          })
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        children: loading ? /* @__PURE__ */ jsx("div", {
          className: "flex items-center justify-center py-20",
          children: /* @__PURE__ */ jsx(Loader2, {
            className: "h-8 w-8 animate-spin text-primary"
          })
        }) : error ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-center",
          children: [/* @__PURE__ */ jsx(Filter, {
            className: "mb-4 h-16 w-16 text-destructive"
          }), /* @__PURE__ */ jsx("h3", {
            className: "mb-2 text-xl font-semibold",
            children: "Search failed"
          }), /* @__PURE__ */ jsx("p", {
            className: "mb-4 max-w-xl text-muted-foreground",
            children: error
          }), /* @__PURE__ */ jsx(Button, {
            onClick: () => runSearch(activeQuery || searchQuery, (searchResult == null ? void 0 : searchResult.page) ?? 0),
            children: "Retry search"
          })]
        }) : searchResult && searchResult.elements.length > 0 ? /* @__PURE__ */ jsxs("div", {
          className: "space-y-8",
          children: [/* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
            children: searchResult.elements.map((item) => /* @__PURE__ */ jsx(CatalogSearchCard, {
              item
            }, item.id))
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "text-sm text-muted-foreground",
              children: ["Page ", searchResult.page + 1, " of ", Math.max(searchResult.totalPages, 1), " | ", searchResult.totalElements.toLocaleString("en-US"), " total results"]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex gap-3",
              children: [/* @__PURE__ */ jsx(Button, {
                variant: "outline",
                disabled: !searchResult.hasPrevious || searchResult.prevPage === null,
                onClick: () => runSearch(activeQuery, searchResult.prevPage ?? searchResult.page),
                children: "Previous"
              }), /* @__PURE__ */ jsx(Button, {
                variant: "outline",
                disabled: !searchResult.hasNext || searchResult.nextPage === null,
                onClick: () => runSearch(activeQuery, searchResult.nextPage ?? searchResult.page),
                children: "Next"
              })]
            })]
          })]
        }) : activeQuery ? /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-center",
          children: [/* @__PURE__ */ jsx(Filter, {
            className: "mb-4 h-16 w-16 text-muted-foreground"
          }), /* @__PURE__ */ jsx("h3", {
            className: "mb-2 text-xl font-semibold",
            children: "No results found"
          }), /* @__PURE__ */ jsxs("p", {
            className: "mb-4 text-muted-foreground",
            children: ['No catalog entries matched "', activeQuery, '"']
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap justify-center gap-3",
            children: [/* @__PURE__ */ jsx(Button, {
              onClick: clearSearch,
              children: "Clear search"
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              variant: "outline",
              children: /* @__PURE__ */ jsx(Link, {
                to: "/catalog/releases/new",
                children: "Add missing release"
              })
            })]
          })]
        }) : /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-center",
          children: [/* @__PURE__ */ jsx(Filter, {
            className: "mb-4 h-16 w-16 text-muted-foreground"
          }), /* @__PURE__ */ jsx("h3", {
            className: "mb-2 text-xl font-semibold",
            children: "Search the catalog"
          }), /* @__PURE__ */ jsx("p", {
            className: "mb-4 text-muted-foreground",
            children: "Start with a title query and the page will call the backend Elastic search endpoint."
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap justify-center gap-3",
            children: [/* @__PURE__ */ jsx(Button, {
              onClick: () => handleSearch(searchQuery),
              disabled: !searchQuery.trim(),
              children: "Search now"
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              variant: "outline",
              children: /* @__PURE__ */ jsx(Link, {
                to: "/catalog/releases/new",
                children: "Add a release"
              })
            })]
          })]
        })
      })]
    })]
  });
}
const Catalog_default = UNSAFE_withComponentProps(Catalog);
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Catalog,
  default: Catalog_default
}, Symbol.toStringTag, { value: "Module" }));
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Root, { "data-slot": "select", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
    SelectPrimitive.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      ...props,
      children: [
        /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsx(
          SelectPrimitive.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    SelectPrimitive.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckIcon, { className: "size-4" }) }) }),
        /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SelectPrimitive.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4" })
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
const EMPTY_RELEASE_DRAFT = {
  barCode: "",
  country: "",
  format: "",
  releaseYear: "",
  packagingType: "",
  notes: ""
};
function normalizeCountry(value) {
  return value.trim().toUpperCase();
}
function parseReleaseYear(value) {
  const normalizedYear = value.trim();
  if (!/^\d{4}$/.test(normalizedYear)) {
    return null;
  }
  return Number(normalizedYear);
}
function getEditionImageId(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
function formatFileSize(file) {
  return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
}
function AddRelease() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [hasTyped, setHasTyped] = useState(false);
  const [releaseDraft, setReleaseDraft] = useState(EMPTY_RELEASE_DRAFT);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [coverImageId, setCoverImageId] = useState(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [pendingPictureEditionId, setPendingPictureEditionId] = useState(null);
  const [uploadedPictureIdsByImage, setUploadedPictureIdsByImage] = useState({});
  const [pictureUploadLoading, setPictureUploadLoading] = useState(false);
  const requestCounter = useRef(0);
  const containerRef = useRef(null);
  const imageInputRef = useRef(null);
  const selectedImagesRef = useRef([]);
  useEffect(() => {
    const currentRequest = ++requestCounter.current;
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      setIsOpen(false);
      return;
    }
    setLoading(true);
    setError("");
    const timerId = window.setTimeout(async () => {
      try {
        const response = await catalogService.searchTmdbMovie(normalizedQuery, 1);
        if (requestCounter.current !== currentRequest) {
          return;
        }
        setResults(response.results);
        setIsOpen(true);
      } catch (searchError) {
        if (requestCounter.current !== currentRequest) {
          return;
        }
        setResults([]);
        setError(searchError instanceof Error ? searchError.message : "Movie search failed");
      } finally {
        if (requestCounter.current === currentRequest) {
          setLoading(false);
        }
      }
    }, 320);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [query]);
  useEffect(() => {
    const handlePointerDown = (event) => {
      var _a;
      if (!((_a = containerRef.current) == null ? void 0 : _a.contains(event.target))) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);
  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);
  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, []);
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setQuery(movie.title);
    setIsOpen(false);
    setSubmitError("");
    setSubmitSuccess("");
    setReleaseDraft({
      ...EMPTY_RELEASE_DRAFT,
      releaseYear: movie.releaseYear !== "TBA" ? movie.releaseYear : ""
    });
  };
  const handleImageSelection = (files) => {
    if (!files || files.length === 0) {
      return;
    }
    if (pendingPictureEditionId) {
      setSubmitError("Retry the pending picture processing before modifying the selected images");
      return;
    }
    const nextFiles = Array.from(files);
    const invalidFile = nextFiles.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setSubmitError("Select only valid image files before creating the release");
      return;
    }
    const existingImageIds = new Set(selectedImages.map((image) => image.id));
    const newImages = nextFiles.map((file) => ({
      id: getEditionImageId(file),
      file,
      previewUrl: URL.createObjectURL(file)
    })).filter((image) => {
      if (existingImageIds.has(image.id)) {
        URL.revokeObjectURL(image.previewUrl);
        return false;
      }
      return true;
    });
    if (newImages.length === 0) {
      return;
    }
    setSelectedImages((prev) => [...prev, ...newImages]);
    setCoverImageId((prev) => prev ?? newImages[0].id);
    setSubmitError("");
    setSubmitSuccess("");
  };
  const resetImageSelection = () => {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setSelectedImages([]);
    setCoverImageId(null);
    setPendingPictureEditionId(null);
    setUploadedPictureIdsByImage({});
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };
  const removeSelectedImage = (imageId) => {
    if (pendingPictureEditionId) {
      setSubmitError("Retry the pending picture processing before removing images");
      return;
    }
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      const nextImages = prev.filter((image) => image.id !== imageId);
      setCoverImageId((currentCoverId) => {
        var _a;
        if (currentCoverId !== imageId) {
          return currentCoverId;
        }
        return ((_a = nextImages[0]) == null ? void 0 : _a.id) ?? null;
      });
      return nextImages;
    });
  };
  const uploadEditionPictures = async (editionId, images, selectedCoverImageId) => {
    setPictureUploadLoading(true);
    try {
      const uploadedPictureIds = {
        ...uploadedPictureIdsByImage
      };
      for (const image of images) {
        if (uploadedPictureIds[image.id]) {
          continue;
        }
        const uploadedPicture = await catalogService.uploadEditionPicture(editionId, image.file);
        uploadedPictureIds[image.id] = uploadedPicture.id;
        setUploadedPictureIdsByImage({
          ...uploadedPictureIds
        });
      }
      const coverPictureId = uploadedPictureIds[selectedCoverImageId];
      if (!coverPictureId) {
        throw new Error("The selected cover image could not be uploaded");
      }
      await catalogService.setEditionCoverPicture(editionId, coverPictureId);
      setUploadedPictureIdsByImage({});
      setPendingPictureEditionId(null);
    } finally {
      setPictureUploadLoading(false);
    }
  };
  const handleDraftChange = (key, value) => {
    setReleaseDraft((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovie) {
      setSubmitError("Select a film before creating the release");
      return;
    }
    const normalizedBarCode = releaseDraft.barCode.trim();
    const normalizedCountry = normalizeCountry(releaseDraft.country);
    const parsedReleaseYear = parseReleaseYear(releaseDraft.releaseYear);
    if (!normalizedBarCode || !normalizedCountry || !releaseDraft.format || !releaseDraft.packagingType || !parsedReleaseYear) {
      setSubmitError("Complete all required release fields before continuing");
      return;
    }
    if (selectedImages.length === 0 || !coverImageId) {
      setSubmitError("Add one or more images and choose which one should be the cover before creating the release");
      return;
    }
    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess("");
    setPendingPictureEditionId(null);
    setUploadedPictureIdsByImage({});
    let releaseCreated = false;
    try {
      const createdFilm = await catalogService.createFilmFromTmdb(selectedMovie, normalizedCountry);
      const createdRelease = await catalogService.createRelease({
        filmId: createdFilm.id,
        barCode: normalizedBarCode,
        country: normalizedCountry,
        format: releaseDraft.format,
        releaseYear: parsedReleaseYear,
        packagingType: releaseDraft.packagingType,
        notes: releaseDraft.notes.trim()
      });
      releaseCreated = true;
      setPendingPictureEditionId(createdRelease.id);
      await uploadEditionPictures(createdRelease.id, selectedImages, coverImageId);
      setSubmitSuccess(`Release created successfully for "${selectedMovie.title}", all pictures uploaded, and cover assigned`);
      setReleaseDraft({
        ...EMPTY_RELEASE_DRAFT,
        releaseYear: selectedMovie.releaseYear !== "TBA" ? selectedMovie.releaseYear : ""
      });
      resetImageSelection();
    } catch (creationError) {
      if (releaseCreated) {
        setSubmitError(creationError instanceof Error ? creationError.message : "Picture processing failed after the release was created");
      } else {
        setSubmitError(creationError instanceof Error ? creationError.message : "Release creation failed");
      }
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleRetryPictureUpload = async () => {
    if (!pendingPictureEditionId || selectedImages.length === 0 || !coverImageId) {
      return;
    }
    setSubmitError("");
    setSubmitSuccess("");
    try {
      await uploadEditionPictures(pendingPictureEditionId, selectedImages, coverImageId);
      setSubmitSuccess("Edition pictures uploaded successfully and cover assigned");
      resetImageSelection();
    } catch (uploadError) {
      setSubmitError(uploadError instanceof Error ? uploadError.message : "Edition picture processing failed");
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-card/50 backdrop-blur",
        children: /* @__PURE__ */ jsx("div", {
          className: "mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary",
              children: [/* @__PURE__ */ jsx(PlusCircle, {
                className: "h-4 w-4"
              }), "Add release workflow"]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold",
                children: "Add a new release"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-2 max-w-3xl text-muted-foreground",
                children: "Search the film in TMDB, complete the release metadata, then the page will create the film in the backend and immediately attach the release to it."
              })]
            })]
          })
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsx("section", {
          className: "rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-5",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-xl font-semibold",
                children: "1. Search the film"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Type at least two characters. Results are fetched progressively from `/api/catalog/tmdb/search`."
              })]
            }), /* @__PURE__ */ jsxs("div", {
              ref: containerRef,
              className: "relative",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "relative",
                children: [/* @__PURE__ */ jsx(Search, {
                  className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                }), /* @__PURE__ */ jsx(Input, {
                  value: query,
                  onChange: (e) => {
                    setQuery(e.target.value);
                    setHasTyped(true);
                    setIsOpen(true);
                  },
                  onFocus: () => {
                    if (results.length > 0 || query.trim().length >= 2) {
                      setIsOpen(true);
                    }
                  },
                  placeholder: "Search film title, e.g. Rambo",
                  className: "h-12 rounded-xl border-border bg-background pl-12 pr-12"
                }), loading && /* @__PURE__ */ jsx(Loader2, {
                  className: "absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary"
                })]
              }), isOpen && (query.trim().length >= 2 || error) && /* @__PURE__ */ jsx("div", {
                className: "absolute z-30 mt-2 max-h-96 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/20",
                children: /* @__PURE__ */ jsx("div", {
                  className: "max-h-96 overflow-y-auto p-2",
                  children: error ? /* @__PURE__ */ jsx("div", {
                    className: "rounded-xl px-4 py-6 text-sm text-destructive",
                    children: error
                  }) : loading && results.length === 0 ? /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-3 rounded-xl px-4 py-6 text-sm text-muted-foreground",
                    children: [/* @__PURE__ */ jsx(Loader2, {
                      className: "h-4 w-4 animate-spin text-primary"
                    }), "Searching TMDB..."]
                  }) : results.length > 0 ? /* @__PURE__ */ jsx("div", {
                    className: "space-y-2",
                    children: results.map((movie) => /* @__PURE__ */ jsxs("button", {
                      type: "button",
                      onClick: () => handleSelectMovie(movie),
                      className: "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent",
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-secondary",
                        children: /* @__PURE__ */ jsx(ImageWithFallback, {
                          src: movie.posterUrl,
                          alt: movie.title,
                          className: "h-full w-full object-cover"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        className: "min-w-0 flex-1",
                        children: [/* @__PURE__ */ jsx("p", {
                          className: "font-medium",
                          children: movie.title
                        }), /* @__PURE__ */ jsxs("p", {
                          className: "mt-1 text-xs text-muted-foreground",
                          children: [movie.releaseDate || "Release date unavailable", " | Rating ", movie.rating.toFixed(1)]
                        }), /* @__PURE__ */ jsx("p", {
                          className: "mt-2 line-clamp-3 text-sm text-muted-foreground",
                          children: movie.overview
                        })]
                      })]
                    }, movie.id))
                  }) : hasTyped ? /* @__PURE__ */ jsxs("div", {
                    className: "rounded-xl px-4 py-6 text-sm text-muted-foreground",
                    children: ['No films found for "', query.trim(), '".']
                  }) : null
                })
              })]
            })]
          })
        }), /* @__PURE__ */ jsx("section", {
          className: "mt-8 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold",
              children: "2. Selected film"
            }), selectedMovie ? /* @__PURE__ */ jsxs("div", {
              className: "grid gap-6 md:grid-cols-[180px_1fr]",
              children: [/* @__PURE__ */ jsx("div", {
                className: "overflow-hidden rounded-2xl border border-border bg-secondary",
                children: /* @__PURE__ */ jsx("div", {
                  className: "aspect-[3/4]",
                  children: /* @__PURE__ */ jsx(ImageWithFallback, {
                    src: selectedMovie.posterUrl,
                    alt: selectedMovie.title,
                    className: "h-full w-full object-cover"
                  })
                })
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-start justify-between gap-4",
                  children: [/* @__PURE__ */ jsxs("div", {
                    children: [/* @__PURE__ */ jsx("h3", {
                      className: "text-2xl font-bold",
                      children: selectedMovie.title
                    }), /* @__PURE__ */ jsxs("p", {
                      className: "mt-1 text-sm text-muted-foreground",
                      children: ["Release date: ", selectedMovie.releaseDate || "TBA", " | Rating ", selectedMovie.rating.toFixed(1)]
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400",
                    children: [/* @__PURE__ */ jsx(CheckCircle2, {
                      className: "h-4 w-4"
                    }), "Film selected"]
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "leading-7 text-muted-foreground",
                  children: selectedMovie.overview
                }), /* @__PURE__ */ jsx("div", {
                  className: "rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground",
                  children: "The backend will create this film idempotently using its TMDB id, then the resulting internal film id will be used to create the release."
                })]
              })]
            }) : /* @__PURE__ */ jsx("div", {
              className: "rounded-xl border border-dashed border-border px-5 py-8 text-sm text-muted-foreground",
              children: "Search and choose a film above to continue with the release creation flow."
            })]
          })
        }), /* @__PURE__ */ jsx("section", {
          className: "mt-8 rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10",
          children: /* @__PURE__ */ jsxs("div", {
            className: "space-y-6",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-xl font-semibold",
                children: "3. Release metadata"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-sm text-muted-foreground",
                children: "Complete the release information. `filmId` is not editable here because it will come from the backend after the film is created or resolved idempotently."
              })]
            }), /* @__PURE__ */ jsxs("form", {
              onSubmit: handleSubmit,
              className: "space-y-6",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "grid gap-5 md:grid-cols-2",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "text-sm font-medium",
                    children: "Barcode"
                  }), /* @__PURE__ */ jsx(Input, {
                    value: releaseDraft.barCode,
                    onChange: (e) => handleDraftChange("barCode", e.target.value),
                    placeholder: "e.g. 5050582461234",
                    disabled: !selectedMovie || submitLoading
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "text-sm font-medium",
                    children: "Country"
                  }), /* @__PURE__ */ jsx(Input, {
                    value: releaseDraft.country,
                    onChange: (e) => handleDraftChange("country", normalizeCountry(e.target.value)),
                    placeholder: "e.g. US",
                    disabled: !selectedMovie || submitLoading,
                    maxLength: 2
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "text-sm font-medium",
                    children: "Format"
                  }), /* @__PURE__ */ jsxs(Select, {
                    value: releaseDraft.format,
                    onValueChange: (value) => handleDraftChange("format", value),
                    disabled: !selectedMovie || submitLoading,
                    children: [/* @__PURE__ */ jsx(SelectTrigger, {
                      children: /* @__PURE__ */ jsx(SelectValue, {
                        placeholder: "Select a format"
                      })
                    }), /* @__PURE__ */ jsx(SelectContent, {
                      children: FORMAT_OPTIONS.map((option) => /* @__PURE__ */ jsx(SelectItem, {
                        value: option,
                        children: option
                      }, option))
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "text-sm font-medium",
                    children: "Packaging type"
                  }), /* @__PURE__ */ jsxs(Select, {
                    value: releaseDraft.packagingType,
                    onValueChange: (value) => handleDraftChange("packagingType", value),
                    disabled: !selectedMovie || submitLoading,
                    children: [/* @__PURE__ */ jsx(SelectTrigger, {
                      children: /* @__PURE__ */ jsx(SelectValue, {
                        placeholder: "Select a packaging type"
                      })
                    }), /* @__PURE__ */ jsx(SelectContent, {
                      children: PACKAGING_TYPE_OPTIONS.map((option) => /* @__PURE__ */ jsx(SelectItem, {
                        value: option,
                        children: option
                      }, option))
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "space-y-2 md:col-span-2",
                  children: [/* @__PURE__ */ jsx("label", {
                    className: "text-sm font-medium",
                    children: "Release year"
                  }), /* @__PURE__ */ jsx(Input, {
                    value: releaseDraft.releaseYear,
                    onChange: (e) => handleDraftChange("releaseYear", e.target.value),
                    placeholder: "e.g. 2008",
                    disabled: !selectedMovie || submitLoading,
                    inputMode: "numeric",
                    maxLength: 4
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-2",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "text-sm font-medium",
                  children: "Notes"
                }), /* @__PURE__ */ jsx(Textarea, {
                  value: releaseDraft.notes,
                  onChange: (e) => handleDraftChange("notes", e.target.value),
                  placeholder: "Optional release-specific notes",
                  disabled: !selectedMovie || submitLoading,
                  className: "min-h-24"
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-4",
                children: [/* @__PURE__ */ jsx("label", {
                  className: "text-sm font-medium",
                  children: "Edition pictures"
                }), /* @__PURE__ */ jsx("input", {
                  ref: imageInputRef,
                  type: "file",
                  accept: "image/*",
                  multiple: true,
                  className: "hidden",
                  onChange: (e) => handleImageSelection(e.target.files),
                  disabled: !selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId
                }), /* @__PURE__ */ jsx("button", {
                  type: "button",
                  onClick: () => {
                    var _a;
                    return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                  },
                  onDragOver: (e) => {
                    e.preventDefault();
                    if (!selectedMovie || submitLoading || pictureUploadLoading) {
                      return;
                    }
                    setIsDraggingImage(true);
                  },
                  onDragLeave: (e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                  },
                  onDrop: (e) => {
                    e.preventDefault();
                    setIsDraggingImage(false);
                    if (!selectedMovie || submitLoading || pictureUploadLoading) {
                      return;
                    }
                    handleImageSelection(e.dataTransfer.files);
                  },
                  disabled: !selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                  className: `flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${isDraggingImage ? "border-primary bg-primary/10" : "border-border bg-background/60 hover:border-primary/40 hover:bg-primary/5"} disabled:cursor-not-allowed disabled:opacity-60`,
                  children: selectedImages.length > 0 ? /* @__PURE__ */ jsxs("div", {
                    className: "space-y-1",
                    children: [/* @__PURE__ */ jsxs("p", {
                      className: "font-medium",
                      children: [selectedImages.length, " image", selectedImages.length === 1 ? "" : "s", " selected"]
                    }), /* @__PURE__ */ jsx("p", {
                      className: "text-sm text-muted-foreground",
                      children: "Choose the cover below. All images will be uploaded one after another."
                    })]
                  }) : /* @__PURE__ */ jsxs(Fragment, {
                    children: [/* @__PURE__ */ jsx("div", {
                      className: "rounded-full border border-primary/20 bg-primary/10 p-3 text-primary",
                      children: isDraggingImage ? /* @__PURE__ */ jsx(Upload, {
                        className: "h-5 w-5"
                      }) : /* @__PURE__ */ jsx(ImagePlus, {
                        className: "h-5 w-5"
                      })
                    }), /* @__PURE__ */ jsxs("div", {
                      className: "space-y-1",
                      children: [/* @__PURE__ */ jsx("p", {
                        className: "font-medium",
                        children: "Drag the edition images here or click to choose them"
                      }), /* @__PURE__ */ jsx("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Add one or more images, then choose which one should become the cover."
                      })]
                    })]
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap items-center gap-3",
                  children: [/* @__PURE__ */ jsx(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: () => {
                      var _a;
                      return (_a = imageInputRef.current) == null ? void 0 : _a.click();
                    },
                    disabled: !selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                    children: "Add images"
                  }), selectedImages.length > 0 && /* @__PURE__ */ jsx(Button, {
                    type: "button",
                    variant: "ghost",
                    onClick: resetImageSelection,
                    disabled: submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                    children: "Clear images"
                  })]
                }), selectedImages.length > 0 && /* @__PURE__ */ jsx("div", {
                  className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
                  children: selectedImages.map((image) => {
                    const isCover = coverImageId === image.id;
                    const alreadyUploaded = !!uploadedPictureIdsByImage[image.id];
                    return /* @__PURE__ */ jsxs("div", {
                      className: `rounded-2xl border p-4 transition-colors ${isCover ? "border-primary bg-primary/5" : "border-border bg-background/60"}`,
                      children: [/* @__PURE__ */ jsx("div", {
                        className: "aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary",
                        children: /* @__PURE__ */ jsx("img", {
                          src: image.previewUrl,
                          alt: image.file.name,
                          className: "h-full w-full object-cover"
                        })
                      }), /* @__PURE__ */ jsxs("div", {
                        className: "mt-4 space-y-3",
                        children: [/* @__PURE__ */ jsxs("div", {
                          className: "space-y-1",
                          children: [/* @__PURE__ */ jsx("p", {
                            className: "truncate font-medium",
                            children: image.file.name
                          }), /* @__PURE__ */ jsx("p", {
                            className: "text-sm text-muted-foreground",
                            children: formatFileSize(image.file)
                          })]
                        }), /* @__PURE__ */ jsxs("div", {
                          className: "flex flex-wrap items-center gap-2",
                          children: [/* @__PURE__ */ jsx(Button, {
                            type: "button",
                            size: "sm",
                            variant: isCover ? "default" : "outline",
                            onClick: () => setCoverImageId(image.id),
                            disabled: submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                            children: isCover ? "Cover selected" : "Set as cover"
                          }), /* @__PURE__ */ jsx(Button, {
                            type: "button",
                            size: "sm",
                            variant: "ghost",
                            onClick: () => removeSelectedImage(image.id),
                            disabled: submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                            children: "Remove"
                          })]
                        }), /* @__PURE__ */ jsx("div", {
                          className: "text-xs text-muted-foreground",
                          children: alreadyUploaded ? "Uploaded for this edition" : isCover ? "Will be assigned as cover" : "Will be uploaded as an additional image"
                        })]
                      })]
                    }, image.id);
                  })
                })]
              }), submitError && /* @__PURE__ */ jsx("div", {
                className: "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
                children: submitError
              }), submitSuccess && /* @__PURE__ */ jsx("div", {
                className: "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400",
                children: submitSuccess
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background/60 p-4",
                children: [/* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Submit flow: create film from TMDB data, create the release with the returned `filmId`, upload every selected image with the returned `editionId`, then assign the chosen image as the edition cover."
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap gap-3",
                  children: [pendingPictureEditionId && selectedImages.length > 0 && coverImageId && /* @__PURE__ */ jsx(Button, {
                    type: "button",
                    variant: "outline",
                    onClick: handleRetryPictureUpload,
                    disabled: submitLoading || pictureUploadLoading,
                    children: pictureUploadLoading ? /* @__PURE__ */ jsxs(Fragment, {
                      children: [/* @__PURE__ */ jsx(Loader2, {
                        className: "h-4 w-4 animate-spin"
                      }), "Processing images..."]
                    }) : "Retry picture processing"
                  }), /* @__PURE__ */ jsx(Button, {
                    type: "submit",
                    disabled: !selectedMovie || submitLoading || pictureUploadLoading || !!pendingPictureEditionId,
                    children: submitLoading ? /* @__PURE__ */ jsxs(Fragment, {
                      children: [/* @__PURE__ */ jsx(Loader2, {
                        className: "h-4 w-4 animate-spin"
                      }), "Creating release..."]
                    }) : pictureUploadLoading ? /* @__PURE__ */ jsxs(Fragment, {
                      children: [/* @__PURE__ */ jsx(Loader2, {
                        className: "h-4 w-4 animate-spin"
                      }), "Processing images..."]
                    }) : "Create release"
                  })]
                })]
              })]
            })]
          })
        })]
      })]
    })]
  });
}
const AddRelease_default = UNSAFE_withComponentProps(AddRelease);
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AddRelease,
  default: AddRelease_default
}, Symbol.toStringTag, { value: "Module" }));
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      "data-slot": "separator-root",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
const COLLECTION_CONDITION_OPTIONS = [
  "Mint",
  "NearMint",
  "VeryGoodPlus",
  "VeryGood",
  "GoodPlus",
  "Good",
  "Fair",
  "Poor"
];
function getDefaultCollectionItemFormValues() {
  return {
    purchaseDate: "",
    purchasePlace: "",
    purchasePrice: "",
    mediaCondition: "NearMint",
    caseCondition: "NearMint",
    comments: ""
  };
}
function mapCollectionItemDetailToFormValues(detail) {
  if (!detail) {
    return getDefaultCollectionItemFormValues();
  }
  return {
    purchaseDate: detail.purchaseDate ?? "",
    purchasePlace: detail.purchasePlace ?? "",
    purchasePrice: detail.purchasePrice != null ? String(detail.purchasePrice) : "",
    mediaCondition: detail.mediaCondition,
    caseCondition: detail.caseCondition,
    comments: detail.comments
  };
}
function getCollectionSection(format) {
  switch (format) {
    case "UHD_4K":
      return "uhd-4k";
    case "BluRay":
      return "bluray";
    case "DVD":
      return "dvd";
    default:
      return "other";
  }
}
function mapCollectionItemDetail(payload) {
  var _a, _b;
  if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.item_id) || !payload.data.edition_id) {
    return null;
  }
  return {
    id: payload.data.item_id,
    editionId: payload.data.edition_id,
    purchaseDate: payload.data.purchase_date ?? null,
    purchasePlace: payload.data.purchase_place ?? null,
    purchasePrice: payload.data.purchase_price ?? null,
    mediaCondition: payload.data.media_condition ?? "NearMint",
    caseCondition: payload.data.case_condition ?? "NearMint",
    comments: ((_b = payload.data.comments) == null ? void 0 : _b.trim()) ?? ""
  };
}
function buildCollectionMutationPayload(request) {
  var _a, _b;
  const basePayload = {
    purchase_date: request.purchaseDate ?? null,
    purchase_place: ((_a = request.purchasePlace) == null ? void 0 : _a.trim()) || null,
    purchase_price: request.purchasePrice ?? null,
    media_condition: request.mediaCondition ?? "NearMint",
    case_condition: request.caseCondition ?? "NearMint",
    comments: ((_b = request.comments) == null ? void 0 : _b.trim()) || null
  };
  if ("editionId" in request) {
    return {
      edition_id: request.editionId,
      ...basePayload
    };
  }
  return {
    id: request.id,
    ...basePayload
  };
}
async function extractPayloadOrError(response, fallbackMessage) {
  const payload = await parseJsonSafely(response);
  if (response.ok) {
    return payload;
  }
  const message = (payload == null ? void 0 : payload.message) ?? (payload == null ? void 0 : payload.error) ?? fallbackMessage;
  throw new Error(typeof message === "string" ? message : fallbackMessage);
}
async function getEditionDetailsById(collectionItems) {
  const uniqueEditionIds = Array.from(
    new Set(collectionItems.map((item) => item.edition_id).filter(Boolean))
  );
  const detailEntries = await Promise.all(
    uniqueEditionIds.map(async (editionId) => {
      try {
        const detail = await catalogService.getEditionById(editionId);
        return [editionId, detail];
      } catch {
        return [editionId, null];
      }
    })
  );
  return new Map(
    detailEntries.filter(
      (entry2) => entry2[1] !== null
    )
  );
}
function mapCollectionItem(item, editionDetail) {
  var _a, _b;
  return {
    id: item.id,
    editionId: item.edition_id,
    filmTitle: item.film_name,
    releaseSlug: (editionDetail == null ? void 0 : editionDetail.slug) ?? "",
    coverPicture: (editionDetail == null ? void 0 : editionDetail.coverPictureUrl) ?? "",
    releaseYear: ((_a = item.edition_release_year) == null ? void 0 : _a.value) ?? (editionDetail == null ? void 0 : editionDetail.releaseYear) ?? 0,
    country: item.edition_country,
    format: item.edition_format,
    packagingType: item.edition_packaging,
    caseCondition: item.item_case_condition,
    mediaCondition: item.item_media_condition,
    comments: ((_b = item.item_comments) == null ? void 0 : _b.trim()) ?? "",
    addedAt: item.item_added_date,
    section: getCollectionSection(item.edition_format)
  };
}
const collectionService = {
  async getUserCollection(page = 0, size = 100) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    const response = await apiFetch(`/api/catalog/items/collection?${params.toString()}`, {
      method: "GET",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await extractPayloadOrError(
      response,
      `Collection fetch failed with status ${response.status}`
    );
    const elements = ((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.elements) ?? [];
    const editionDetailsById = await getEditionDetailsById(elements);
    return {
      elements: elements.map(
        (item) => mapCollectionItem(item, editionDetailsById.get(item.edition_id) ?? null)
      ),
      page: ((_b = payload == null ? void 0 : payload.data) == null ? void 0 : _b.page) ?? 0,
      size: ((_c = payload == null ? void 0 : payload.data) == null ? void 0 : _c.size) ?? size,
      totalElements: ((_d = payload == null ? void 0 : payload.data) == null ? void 0 : _d.total_elements) ?? elements.length,
      totalPages: ((_e = payload == null ? void 0 : payload.data) == null ? void 0 : _e.total_pages) ?? 1,
      hasNext: ((_f = payload == null ? void 0 : payload.data) == null ? void 0 : _f.has_next) ?? false,
      hasPrevious: ((_g = payload == null ? void 0 : payload.data) == null ? void 0 : _g.has_previous) ?? false,
      nextPage: ((_h = payload == null ? void 0 : payload.data) == null ? void 0 : _h.next_page) ?? null,
      prevPage: ((_i = payload == null ? void 0 : payload.data) == null ? void 0 : _i.prev_page) ?? null
    };
  },
  async getCollectionItem(id) {
    const response = await apiFetch(`/api/catalog/items/${id}`, {
      method: "GET",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await extractPayloadOrError(
      response,
      `Collection item fetch failed with status ${response.status}`
    );
    return mapCollectionItemDetail(payload);
  },
  async addToCollection(request) {
    var _a;
    const response = await apiFetch("/api/catalog/items", {
      method: "POST",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildCollectionMutationPayload(request))
    });
    const payload = await extractPayloadOrError(
      response,
      `Add to collection failed with status ${response.status}`
    );
    if (!((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.id)) {
      throw new Error("Invalid add to collection response");
    }
    return payload.data.id;
  },
  async updateCollectionItem(request) {
    var _a;
    const response = await apiFetch("/api/catalog/items", {
      method: "PUT",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildCollectionMutationPayload(request))
    });
    const payload = await extractPayloadOrError(
      response,
      `Collection update failed with status ${response.status}`
    );
    if (((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.updated) !== true) {
      throw new Error("Invalid collection update response");
    }
  },
  async removeFromCollection(id) {
    var _a;
    const response = await apiFetch(`/api/catalog/items/${id}`, {
      method: "DELETE",
      auth: "required",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const payload = await extractPayloadOrError(
      response,
      `Collection delete failed with status ${response.status}`
    );
    if (((_a = payload == null ? void 0 : payload.data) == null ? void 0 : _a.deleted) !== true) {
      throw new Error("Invalid collection delete response");
    }
  },
  async isEditionInCollection(editionId) {
    if (!editionId.trim()) {
      return false;
    }
    const collection = await this.getUserCollection(0, 250);
    return collection.elements.some((item) => item.editionId === editionId);
  }
};
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", children: [
            /* @__PURE__ */ jsx(XIcon, {}),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function formatConditionLabel$1(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
function CollectionItemDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  initialValues,
  onSubmit,
  submitting = false,
  loading = false,
  error = ""
}) {
  const [formValues, setFormValues] = useState(initialValues);
  useEffect(() => {
    if (open) {
      setFormValues(initialValues);
    }
  }, [initialValues, open]);
  const handleChange = (key, value) => {
    setFormValues((previous) => ({
      ...previous,
      [key]: value
    }));
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formValues);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-2xl", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: title }),
      /* @__PURE__ */ jsx(DialogDescription, { children: description })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxs("form", { className: "space-y-5", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Purchase date" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "date",
              value: formValues.purchaseDate,
              onChange: (event) => handleChange("purchaseDate", event.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Purchase price" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0.01",
              step: "0.01",
              placeholder: "29.99",
              value: formValues.purchasePrice,
              onChange: (event) => handleChange("purchasePrice", event.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Purchase place" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Amazon, CEX, local store...",
            value: formValues.purchasePlace,
            onChange: (event) => handleChange("purchasePlace", event.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Media condition" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: formValues.mediaCondition,
              onValueChange: (value) => handleChange("mediaCondition", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select media condition" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: COLLECTION_CONDITION_OPTIONS.map((option) => /* @__PURE__ */ jsx(SelectItem, { value: option, children: formatConditionLabel$1(option) }, option)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Case condition" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: formValues.caseCondition,
              onValueChange: (value) => handleChange("caseCondition", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select case condition" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: COLLECTION_CONDITION_OPTIONS.map((option) => /* @__PURE__ */ jsx(SelectItem, { value: option, children: formatConditionLabel$1(option) }, option)) })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Comments" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            rows: 5,
            placeholder: "Limited edition, sealed, with slipcover...",
            value: formValues.comments,
            onChange: (event) => handleChange("comments", event.target.value)
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive", children: error }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: () => onOpenChange(false), disabled: submitting, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: submitting, children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
          "Saving..."
        ] }) : submitLabel })
      ] })
    ] })
  ] }) });
}
function formatReleaseYear(year) {
  return year > 0 ? String(year) : "Unknown year";
}
function formatUploadedAt(value) {
  if (!value) {
    return "Unknown upload date";
  }
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }
  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ReleaseDetail() {
  var _a;
  const {
    slug = ""
  } = useParams();
  const location = useLocation();
  const locationState = location.state;
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemDialogError, setItemDialogError] = useState("");
  const [activePictureId, setActivePictureId] = useState("");
  const [isInCollection, setIsInCollection] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const resolvedEditionId = ((_a = locationState == null ? void 0 : locationState.editionId) == null ? void 0 : _a.trim()) || catalogService.getEditionIdBySlug(slug);
  useEffect(() => {
    var _a2;
    if ((_a2 = locationState == null ? void 0 : locationState.editionId) == null ? void 0 : _a2.trim()) {
      catalogService.rememberEditionIdentity(slug, locationState.editionId);
    }
  }, [locationState == null ? void 0 : locationState.editionId, slug]);
  useEffect(() => {
    if (!slug || !resolvedEditionId) {
      setLoading(false);
      setError("The edition id could not be resolved from this slug. Open the release from the catalog search results first.");
      return;
    }
    let active = true;
    const loadRelease = async () => {
      var _a2;
      setLoading(true);
      setError("");
      try {
        const [detail, collectionState] = await Promise.all([catalogService.getEditionById(resolvedEditionId), collectionService.isEditionInCollection(resolvedEditionId)]);
        if (!active) {
          return;
        }
        setRelease(detail);
        setIsInCollection(collectionState);
        setActivePictureId(detail.coverPictureId || ((_a2 = detail.pictures[0]) == null ? void 0 : _a2.id) || "");
      } catch (detailError) {
        if (!active) {
          return;
        }
        setError(detailError instanceof Error ? detailError.message : "Release detail could not be loaded");
        setRelease(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void loadRelease();
    return () => {
      active = false;
    };
  }, [resolvedEditionId, slug]);
  const handleAddToCollection = async (values) => {
    if (!release || isInCollection) {
      return;
    }
    setAddingToCollection(true);
    setItemDialogError("");
    const parsedPrice = values.purchasePrice.trim() ? Number(values.purchasePrice) : void 0;
    try {
      await collectionService.addToCollection({
        editionId: release.id,
        purchaseDate: values.purchaseDate || void 0,
        purchasePlace: values.purchasePlace || void 0,
        purchasePrice: Number.isFinite(parsedPrice) ? parsedPrice : void 0,
        caseCondition: values.caseCondition,
        mediaCondition: values.mediaCondition,
        comments: values.comments || void 0
      });
      setIsInCollection(true);
      setIsItemDialogOpen(false);
    } catch (addError) {
      setItemDialogError(addError instanceof Error ? addError.message : "Release could not be added to the collection");
    } finally {
      setAddingToCollection(false);
    }
  };
  const activePicture = (release == null ? void 0 : release.pictures.find((picture) => picture.id === activePictureId)) ?? (release == null ? void 0 : release.pictures[0]) ?? null;
  if (loading) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
        className: "flex min-h-[70vh] items-center justify-center bg-background",
        children: /* @__PURE__ */ jsx(Loader2, {
          className: "h-8 w-8 animate-spin text-primary"
        })
      })]
    });
  }
  if (error || !release) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
        className: "min-h-screen bg-background",
        children: /* @__PURE__ */ jsxs("div", {
          className: "mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-bold",
            children: "Release unavailable"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-3 max-w-2xl text-muted-foreground",
            children: error || "This release could not be loaded."
          }), /* @__PURE__ */ jsx("div", {
            className: "mt-6 flex flex-wrap justify-center gap-3",
            children: /* @__PURE__ */ jsx(Button, {
              asChild: true,
              children: /* @__PURE__ */ jsx(Link, {
                to: "/catalog",
                children: "Back to catalog"
              })
            })
          })]
        })
      })]
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.18),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))] text-slate-50",
      children: /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-8 flex flex-wrap items-center justify-between gap-4",
          children: [/* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "outline",
            className: "border-slate-700 bg-slate-950/40 text-slate-100 hover:bg-slate-900",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/catalog",
              children: [/* @__PURE__ */ jsx(ArrowLeft, {
                className: "h-4 w-4"
              }), "Back to catalog"]
            })
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap gap-2",
            children: [/* @__PURE__ */ jsxs(Badge, {
              className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-200",
              children: [/* @__PURE__ */ jsx(ShieldCheck, {
                className: "mr-1 h-3.5 w-3.5"
              }), release.verified ? "Verified release" : "Pending verification"]
            }), /* @__PURE__ */ jsxs(Badge, {
              variant: "outline",
              className: "border-slate-700 bg-slate-900/70 text-slate-200",
              children: ["Slug: ", release.slug]
            })]
          })]
        }), /* @__PURE__ */ jsx("section", {
          className: "overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/70 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur",
          children: /* @__PURE__ */ jsxs("div", {
            className: "grid gap-0 lg:grid-cols-[minmax(320px,420px)_1fr]",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "border-b border-slate-800 bg-slate-900/70 p-6 lg:border-b-0 lg:border-r",
              children: [/* @__PURE__ */ jsx("div", {
                className: "overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900",
                children: /* @__PURE__ */ jsx("div", {
                  className: "aspect-[3/4]",
                  children: activePicture ? /* @__PURE__ */ jsx(ImageWithFallback, {
                    src: activePicture.url,
                    alt: release.slug,
                    className: "h-full w-full object-cover"
                  }) : /* @__PURE__ */ jsx("div", {
                    className: "flex h-full w-full items-center justify-center text-slate-500",
                    children: /* @__PURE__ */ jsx(ImageIcon, {
                      className: "h-12 w-12"
                    })
                  })
                })
              }), /* @__PURE__ */ jsxs("div", {
                className: "mt-5 space-y-3",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [/* @__PURE__ */ jsx("h2", {
                    className: "text-lg font-semibold",
                    children: "Picture archive"
                  }), /* @__PURE__ */ jsxs("span", {
                    className: "text-sm text-slate-400",
                    children: [release.pictures.length, " file", release.pictures.length === 1 ? "" : "s"]
                  })]
                }), release.pictures.length > 0 ? /* @__PURE__ */ jsx("div", {
                  className: "grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3",
                  children: release.pictures.map((picture) => {
                    const isActive = picture.id === (activePicture == null ? void 0 : activePicture.id);
                    return /* @__PURE__ */ jsx("button", {
                      type: "button",
                      onClick: () => setActivePictureId(picture.id),
                      className: `overflow-hidden rounded-xl border transition ${isActive ? "border-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.7)]" : "border-slate-800 hover:border-slate-600"}`,
                      children: /* @__PURE__ */ jsx("div", {
                        className: "aspect-[3/4] bg-slate-900",
                        children: /* @__PURE__ */ jsx(ImageWithFallback, {
                          src: picture.url,
                          alt: picture.id,
                          className: "h-full w-full object-cover"
                        })
                      })
                    }, picture.id);
                  })
                }) : /* @__PURE__ */ jsx("div", {
                  className: "rounded-2xl border border-dashed border-slate-800 px-4 py-6 text-center text-sm text-slate-400",
                  children: "No pictures were attached to this release."
                })]
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "p-6 sm:p-8 lg:p-10",
              children: /* @__PURE__ */ jsxs("div", {
                className: "flex flex-col gap-6",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "space-y-4",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex flex-wrap items-center gap-3",
                    children: [/* @__PURE__ */ jsx(Badge, {
                      className: "bg-sky-500/15 text-sky-200",
                      children: release.format || "Unknown format"
                    }), release.packagingType && /* @__PURE__ */ jsxs(Badge, {
                      variant: "outline",
                      className: "border-slate-700 bg-slate-900/70 text-slate-200",
                      children: [/* @__PURE__ */ jsx(Package2, {
                        className: "mr-1 h-3.5 w-3.5"
                      }), release.packagingType]
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    children: [/* @__PURE__ */ jsx("p", {
                      className: "text-sm uppercase tracking-[0.22em] text-slate-400",
                      children: "Edition archive"
                    }), /* @__PURE__ */ jsx("h1", {
                      className: "mt-2 text-4xl font-black tracking-tight sm:text-5xl",
                      children: release.slug
                    })]
                  }), /* @__PURE__ */ jsx("p", {
                    className: "max-w-3xl text-base leading-7 text-slate-300",
                    children: "A release-focused detail view built around the backend edition record, with gallery browsing, physical metadata, and verification status surfaced in one place."
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "flex flex-wrap gap-3 pt-2",
                    children: [isInCollection ? /* @__PURE__ */ jsxs(Button, {
                      size: "lg",
                      disabled: true,
                      className: "gap-2",
                      children: [/* @__PURE__ */ jsx(Check, {
                        className: "h-5 w-5"
                      }), "Already in collection"]
                    }) : /* @__PURE__ */ jsxs(Button, {
                      size: "lg",
                      onClick: () => setIsItemDialogOpen(true),
                      disabled: addingToCollection,
                      className: "gap-2",
                      children: [/* @__PURE__ */ jsx(Plus, {
                        className: "h-5 w-5"
                      }), "Add edition to collection"]
                    }), /* @__PURE__ */ jsx(Button, {
                      asChild: true,
                      size: "lg",
                      variant: "outline",
                      className: "border-slate-700 bg-slate-950/40 text-slate-100 hover:bg-slate-900",
                      children: /* @__PURE__ */ jsx(Link, {
                        to: "/collection",
                        children: "Open collection"
                      })
                    })]
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
                    children: [/* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-2 text-sm text-slate-400",
                      children: [/* @__PURE__ */ jsx(ScanLine, {
                        className: "h-4 w-4"
                      }), "Barcode"]
                    }), /* @__PURE__ */ jsx("p", {
                      className: "mt-3 break-all text-lg font-semibold text-slate-100",
                      children: release.barcode || "Not available"
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
                    children: [/* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-2 text-sm text-slate-400",
                      children: [/* @__PURE__ */ jsx(Globe, {
                        className: "h-4 w-4"
                      }), "Country"]
                    }), /* @__PURE__ */ jsx("p", {
                      className: "mt-3 text-lg font-semibold text-slate-100",
                      children: release.country || "Unknown"
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
                    children: [/* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-2 text-sm text-slate-400",
                      children: [/* @__PURE__ */ jsx(Calendar, {
                        className: "h-4 w-4"
                      }), "Release year"]
                    }), /* @__PURE__ */ jsx("p", {
                      className: "mt-3 text-lg font-semibold text-slate-100",
                      children: formatReleaseYear(release.releaseYear)
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-4",
                    children: [/* @__PURE__ */ jsxs("div", {
                      className: "flex items-center gap-2 text-sm text-slate-400",
                      children: [/* @__PURE__ */ jsx(BadgeCheck, {
                        className: "h-4 w-4"
                      }), "Edition id"]
                    }), /* @__PURE__ */ jsx("p", {
                      className: "mt-3 break-all text-lg font-semibold text-slate-100",
                      children: release.id
                    })]
                  })]
                }), /* @__PURE__ */ jsx(Separator, {
                  className: "bg-slate-800"
                }), /* @__PURE__ */ jsxs("div", {
                  className: "grid gap-8 xl:grid-cols-[1.2fr_0.8fr]",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "space-y-4",
                    children: [/* @__PURE__ */ jsx("h2", {
                      className: "text-xl font-semibold",
                      children: "Collector notes"
                    }), /* @__PURE__ */ jsx("div", {
                      className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-slate-300",
                      children: release.notes ? /* @__PURE__ */ jsx("p", {
                        className: "leading-7",
                        children: release.notes
                      }) : /* @__PURE__ */ jsx("p", {
                        className: "text-slate-500",
                        children: "No release notes were provided for this edition."
                      })
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "space-y-4",
                    children: [/* @__PURE__ */ jsx("h2", {
                      className: "text-xl font-semibold",
                      children: "Record integrity"
                    }), /* @__PURE__ */ jsx("div", {
                      className: "rounded-2xl border border-slate-800 bg-slate-900/70 p-5",
                      children: /* @__PURE__ */ jsxs("dl", {
                        className: "space-y-4 text-sm",
                        children: [/* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-4",
                          children: [/* @__PURE__ */ jsx("dt", {
                            className: "text-slate-400",
                            children: "Film id"
                          }), /* @__PURE__ */ jsx("dd", {
                            className: "break-all text-right font-medium text-slate-100",
                            children: release.filmId
                          })]
                        }), /* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-4",
                          children: [/* @__PURE__ */ jsx("dt", {
                            className: "text-slate-400",
                            children: "Verification"
                          }), /* @__PURE__ */ jsx("dd", {
                            className: "font-medium text-slate-100",
                            children: release.verified ? "Verified" : "Not verified"
                          })]
                        }), /* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-4",
                          children: [/* @__PURE__ */ jsx("dt", {
                            className: "text-slate-400",
                            children: "Pictures attached"
                          }), /* @__PURE__ */ jsx("dd", {
                            className: "font-medium text-slate-100",
                            children: release.pictures.length
                          })]
                        }), activePicture && /* @__PURE__ */ jsxs("div", {
                          className: "flex items-start justify-between gap-4",
                          children: [/* @__PURE__ */ jsx("dt", {
                            className: "text-slate-400",
                            children: "Active picture uploaded"
                          }), /* @__PURE__ */ jsx("dd", {
                            className: "text-right font-medium text-slate-100",
                            children: formatUploadedAt(activePicture.uploadedAt)
                          })]
                        })]
                      })
                    })]
                  })]
                })]
              })
            })]
          })
        })]
      })
    }), /* @__PURE__ */ jsx(CollectionItemDialog, {
      open: isItemDialogOpen,
      onOpenChange: (open) => {
        setIsItemDialogOpen(open);
        if (!open) {
          setItemDialogError("");
        }
      },
      title: "Add Item To Collection",
      description: "Create the collection item using the real fields exposed by mv-film-service for this edition.",
      submitLabel: "Create item",
      initialValues: getDefaultCollectionItemFormValues(),
      onSubmit: handleAddToCollection,
      submitting: addingToCollection,
      error: itemDialogError
    })]
  });
}
const ReleaseDetail_default = UNSAFE_withComponentProps(ReleaseDetail);
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ReleaseDetail,
  default: ReleaseDetail_default
}, Symbol.toStringTag, { value: "Module" }));
const POSTER_PALETTES = [
  ["#081f3f", "#1d4ed8", "#7dd3fc"],
  ["#2a0b3f", "#7c3aed", "#f0abfc"],
  ["#1a2e05", "#65a30d", "#bef264"],
  ["#3f0d0d", "#dc2626", "#fca5a5"],
  ["#172554", "#0ea5e9", "#fde68a"],
  ["#3b0764", "#db2777", "#f9a8d4"],
  ["#111827", "#f59e0b", "#fef3c7"],
  ["#0f172a", "#14b8a6", "#99f6e4"]
];
function escapeSvgText(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function getPalette(seed) {
  const index = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) % POSTER_PALETTES.length;
  return POSTER_PALETTES[index];
}
function createPoster(title, year, genre) {
  const [bg, accent, highlight] = getPalette(title);
  const safeTitle = escapeSvgText(title);
  const safeGenre = escapeSvgText(genre.slice(0, 2).join(" / "));
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="55%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${highlight}" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#bg)" />
      <circle cx="320" cy="120" r="110" fill="rgba(255,255,255,0.12)" />
      <circle cx="90" cy="510" r="140" fill="rgba(255,255,255,0.08)" />
      <rect x="32" y="32" width="336" height="536" rx="28" fill="none" stroke="rgba(255,255,255,0.28)" />
      <text x="40" y="92" fill="white" font-family="Georgia, serif" font-size="28" opacity="0.78">${safeGenre}</text>
      <text x="40" y="410" fill="white" font-family="Georgia, serif" font-size="54" font-weight="700">
        <tspan x="40" dy="0">${safeTitle}</tspan>
      </text>
      <text x="40" y="520" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.85">${year}</text>
    </svg>
  `);
}
function createBackdrop(title, director) {
  const [bg, accent, highlight] = getPalette(`${title}-${director}`);
  const safeTitle = escapeSvgText(title);
  const safeDirector = escapeSvgText(director);
  return toDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${bg}" />
          <stop offset="55%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${highlight}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#bg)" />
      <circle cx="980" cy="120" r="160" fill="rgba(255,255,255,0.14)" />
      <circle cx="220" cy="330" r="180" fill="rgba(255,255,255,0.08)" />
      <text x="72" y="210" fill="white" font-family="Georgia, serif" font-size="64" font-weight="700">${safeTitle}</text>
      <text x="72" y="258" fill="rgba(255,255,255,0.82)" font-family="Arial, sans-serif" font-size="28">Directed by ${safeDirector}</text>
    </svg>
  `);
}
const MOCK_MOVIES = [
  {
    id: "1",
    title: "Eternal Shadows",
    year: 2024,
    genre: ["Sci-Fi", "Thriller"],
    director: "Emma Torres",
    synopsis: "In a world where memories can be extracted and sold, a detective must navigate through layers of stolen consciousness to solve a murder that never happened.",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    rating: 8.7,
    duration: 142,
    popularity: 95,
    cast: ["Sarah Chen", "Marcus Reid", "David Park"]
  },
  {
    id: "2",
    title: "The Last Sunset",
    year: 2023,
    genre: ["Drama", "Romance"],
    director: "James Wilson",
    synopsis: "Two strangers meet during the final sunset before eternal darkness falls on Earth, sharing their last hours together in unexpected companionship.",
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=400&fit=crop",
    rating: 9.1,
    duration: 118,
    popularity: 88,
    cast: ["Lisa Morgan", "Tom Anderson"]
  },
  {
    id: "3",
    title: "Neon Dreams",
    year: 2024,
    genre: ["Action", "Cyberpunk"],
    director: "Yuki Tanaka",
    synopsis: "A hacker in Neo-Tokyo discovers a conspiracy that threatens to merge human consciousness with artificial intelligence.",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=400&fit=crop",
    rating: 8.4,
    duration: 135,
    popularity: 92,
    cast: ["Kenji Yamamoto", "Ai Sato", "Ryan Lee"]
  },
  {
    id: "4",
    title: "Whispers in the Wind",
    year: 2023,
    genre: ["Fantasy", "Adventure"],
    director: "Sofia Martinez",
    synopsis: "A young musician discovers she can hear the voices of the past through ancient melodies, leading her on a journey to prevent a forgotten catastrophe.",
    poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop",
    rating: 8.9,
    duration: 128,
    popularity: 85,
    cast: ["Elena Rodriguez", "Michael Brown"]
  },
  {
    id: "5",
    title: "The Crimson Void",
    year: 2024,
    genre: ["Horror", "Mystery"],
    director: "Alex Chen",
    synopsis: "An abandoned space station holds dark secrets as a rescue team discovers that isolation can manifest nightmares into reality.",
    poster: "https://images.unsplash.com/photo-1574267432644-f2f4e4a19ae0?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=400&fit=crop",
    rating: 7.8,
    duration: 115,
    popularity: 78,
    cast: ["Jessica Kim", "Robert Taylor", "Nina Patel"]
  },
  {
    id: "6",
    title: "Atlas of Dreams",
    year: 2023,
    genre: ["Animation", "Family"],
    director: "Pierre Dubois",
    synopsis: "A magical atlas transports a curious child to breathtaking worlds where imagination and reality blend seamlessly.",
    poster: "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
    rating: 8.6,
    duration: 98,
    popularity: 90,
    cast: ["Voice: Emma Stone", "Voice: Chris Pratt"]
  },
  {
    id: "7",
    title: "Silent Protocol",
    year: 2024,
    genre: ["Thriller", "Action"],
    director: "Marcus Stone",
    synopsis: "A special forces operative goes rogue to expose a government conspiracy, racing against time before being silenced forever.",
    poster: "https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=400&fit=crop",
    rating: 8.2,
    duration: 125,
    popularity: 87,
    cast: ["Jake Morrison", "Anna White", "Carlos Mendez"]
  },
  {
    id: "8",
    title: "Echoes of Tomorrow",
    year: 2023,
    genre: ["Sci-Fi", "Drama"],
    director: "Lin Wei",
    synopsis: "Scientists receive messages from the future, only to realize their attempts to change the timeline create the very catastrophe they sought to prevent.",
    poster: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=400&fit=crop",
    rating: 9,
    duration: 148,
    popularity: 93,
    cast: ["Wei Zhang", "Sophie Laurent", "Daniel Kim"]
  }
].map((movie) => ({
  ...movie,
  poster: createPoster(movie.title, movie.year, movie.genre),
  backdrop: createBackdrop(movie.title, movie.director)
}));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const filmService = {
  async searchMovies(filters = {}) {
    await delay(400);
    let results = [...MOCK_MOVIES];
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(
        (movie) => movie.title.toLowerCase().includes(query) || movie.synopsis.toLowerCase().includes(query) || movie.director.toLowerCase().includes(query)
      );
    }
    if (filters.genre) {
      results = results.filter((movie) => movie.genre.includes(filters.genre));
    }
    if (filters.year) {
      results = results.filter((movie) => movie.year === filters.year);
    }
    if (filters.minRating) {
      results = results.filter((movie) => movie.rating >= filters.minRating);
    }
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case "popularity":
            return b.popularity - a.popularity;
          case "rating":
            return b.rating - a.rating;
          case "year":
            return b.year - a.year;
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    }
    return results;
  },
  async getMovieById(id) {
    await delay(300);
    return MOCK_MOVIES.find((movie) => movie.id === id) || null;
  },
  async getFeaturedMovies() {
    await delay(400);
    return MOCK_MOVIES.slice(0, 4);
  },
  async getGenres() {
    const genres = /* @__PURE__ */ new Set();
    MOCK_MOVIES.forEach((movie) => {
      movie.genre.forEach((g) => genres.add(g));
    });
    return Array.from(genres).sort();
  }
};
function MovieDetail() {
  const {
    id
  } = useParams();
  const [movie, setMovie] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      void loadMovieData(id);
    }
  }, [id]);
  const loadMovieData = async (movieId) => {
    setLoading(true);
    try {
      const [movieData, articleData] = await Promise.all([filmService.getMovieById(movieId), iaService.getArticlesByMovieId(movieId)]);
      setMovie(movieData);
      setArticles(articleData);
    } catch (error) {
      console.error("Failed to load movie:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
        className: "flex min-h-[60vh] items-center justify-center",
        children: /* @__PURE__ */ jsx(Loader2, {
          className: "h-8 w-8 animate-spin text-primary"
        })
      })]
    });
  }
  if (!movie) {
    return /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
        className: "flex min-h-[60vh] flex-col items-center justify-center text-center",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "mb-2 text-2xl font-bold",
          children: "Movie not found"
        }), /* @__PURE__ */ jsx("p", {
          className: "mb-4 text-muted-foreground",
          children: "The movie you're looking for doesn't exist"
        }), /* @__PURE__ */ jsx(Button, {
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            to: "/catalog",
            children: "Browse Catalog"
          })
        })]
      })]
    });
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "relative h-[400px] overflow-hidden",
        children: [/* @__PURE__ */ jsx(ImageWithFallback, {
          src: movie.backdrop,
          alt: movie.title,
          className: "h-full w-full object-cover"
        }), /* @__PURE__ */ jsx("div", {
          className: "absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20"
        }), /* @__PURE__ */ jsx("div", {
          className: "absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        children: [/* @__PURE__ */ jsx("div", {
          className: "relative -mt-64 pb-12",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col gap-8 lg:flex-row",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex-shrink-0",
              children: /* @__PURE__ */ jsx(ImageWithFallback, {
                src: movie.poster,
                alt: movie.title,
                className: "w-full rounded-2xl border-4 border-border shadow-2xl lg:w-80"
              })
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex-1 space-y-6 pt-8 lg:pt-16",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "space-y-3",
                children: [/* @__PURE__ */ jsx("h1", {
                  className: "text-4xl font-bold sm:text-5xl",
                  children: movie.title
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap items-center gap-4 text-muted-foreground",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx(Calendar, {
                      className: "h-5 w-5"
                    }), /* @__PURE__ */ jsx("span", {
                      children: movie.year
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx(Clock, {
                      className: "h-5 w-5"
                    }), /* @__PURE__ */ jsxs("span", {
                      children: [movie.duration, " minutes"]
                    })]
                  }), /* @__PURE__ */ jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [/* @__PURE__ */ jsx(Star, {
                      className: "h-5 w-5 fill-yellow-500 text-yellow-500"
                    }), /* @__PURE__ */ jsxs("span", {
                      className: "font-semibold",
                      children: [movie.rating.toFixed(1), "/10"]
                    })]
                  })]
                })]
              }), /* @__PURE__ */ jsx("div", {
                className: "flex flex-wrap gap-2",
                children: movie.genre.map((genre) => /* @__PURE__ */ jsx(Badge, {
                  variant: "secondary",
                  className: "px-3 py-1 text-sm",
                  children: genre
                }, genre))
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2 text-muted-foreground",
                children: [/* @__PURE__ */ jsx(User, {
                  className: "h-5 w-5"
                }), /* @__PURE__ */ jsxs("span", {
                  children: ["Directed by ", /* @__PURE__ */ jsx("span", {
                    className: "font-medium text-foreground",
                    children: movie.director
                  })]
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-2",
                children: [/* @__PURE__ */ jsx("h3", {
                  className: "text-xl font-semibold",
                  children: "Synopsis"
                }), /* @__PURE__ */ jsx("p", {
                  className: "leading-relaxed text-muted-foreground",
                  children: movie.synopsis
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-2",
                children: [/* @__PURE__ */ jsx("h3", {
                  className: "text-xl font-semibold",
                  children: "Cast"
                }), /* @__PURE__ */ jsx("div", {
                  className: "flex flex-wrap gap-2",
                  children: movie.cast.map((actor) => /* @__PURE__ */ jsx(Badge, {
                    variant: "outline",
                    children: actor
                  }, actor))
                })]
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-wrap gap-3 pt-4",
                children: [/* @__PURE__ */ jsx(Button, {
                  size: "lg",
                  variant: "outline",
                  asChild: true,
                  children: /* @__PURE__ */ jsx(Link, {
                    to: "/catalog",
                    children: "Find an edition"
                  })
                }), /* @__PURE__ */ jsx(Button, {
                  size: "lg",
                  variant: "outline",
                  asChild: true,
                  children: /* @__PURE__ */ jsx(Link, {
                    to: "/collection",
                    children: "View Collection"
                  })
                })]
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Collection items are now owned as backend edition records, so collection actions happen from release pages instead of abstract movie records."
              })]
            })]
          })
        }), /* @__PURE__ */ jsx(Separator, {
          className: "my-12"
        }), articles.length > 0 && /* @__PURE__ */ jsxs("div", {
          className: "pb-12",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-8 flex items-center gap-3",
            children: [/* @__PURE__ */ jsx(Sparkles, {
              className: "h-6 w-6 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-2xl font-bold",
              children: "AI-Generated Insights"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "space-y-8",
            children: articles.map((article) => /* @__PURE__ */ jsx(AIArticleBlock, {
              article
            }, article.id))
          })]
        })]
      })]
    })]
  });
}
const MovieDetail_default = UNSAFE_withComponentProps(MovieDetail);
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MovieDetail,
  default: MovieDetail_default
}, Symbol.toStringTag, { value: "Module" }));
function formatConditionLabel(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}
function CollectionItemCard({ item, onEdit, onRemove }) {
  const releaseHref = item.releaseSlug ? `/releases/${item.releaseSlug}` : "/catalog";
  const releaseState = item.releaseSlug ? { editionId: item.editionId } : void 0;
  return /* @__PURE__ */ jsx("div", { className: "group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-4", children: [
    /* @__PURE__ */ jsx(Link, { to: releaseHref, state: releaseState, className: "flex-shrink-0", children: /* @__PURE__ */ jsx("div", { className: "relative h-40 w-28 overflow-hidden rounded-lg", children: /* @__PURE__ */ jsx(
      ImageWithFallback,
      {
        src: item.coverPicture,
        alt: item.filmTitle,
        className: "h-full w-full object-cover transition-transform group-hover:scale-105"
      }
    ) }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx(Link, { to: releaseHref, state: releaseState, children: /* @__PURE__ */ jsx("h3", { className: "line-clamp-1 font-semibold transition-colors group-hover:text-primary", children: item.filmTitle }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            item.country || "Unknown country",
            " | ",
            item.releaseYear || "Year N/A"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-8 w-8 p-0",
              onClick: () => onEdit == null ? void 0 : onEdit(item),
              children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-8 w-8 p-0 text-destructive hover:text-destructive",
              onClick: () => onRemove == null ? void 0 : onRemove(item),
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: item.format }),
        item.packagingType && /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
          /* @__PURE__ */ jsx(Package2, { className: "mr-1 h-3.5 w-3.5" }),
          item.packagingType
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
          "Case: ",
          formatConditionLabel(item.caseCondition)
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
          "Media: ",
          formatConditionLabel(item.mediaCondition)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm text-muted-foreground sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ScanLine, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxs("span", { className: "break-all", children: [
            "Edition ",
            item.editionId
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          "Added ",
          new Date(item.addedAt).toLocaleDateString()
        ] })
      ] }),
      item.comments && /* @__PURE__ */ jsxs("p", { className: "line-clamp-2 text-sm italic text-muted-foreground", children: [
        '"',
        item.comments,
        '"'
      ] })
    ] })
  ] }) });
}
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Root,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    TabsPrimitive.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function Collection() {
  const user = authService.getCurrentUser();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemDialogLoading, setItemDialogLoading] = useState(false);
  const [itemDialogSubmitting, setItemDialogSubmitting] = useState(false);
  const [itemDialogError, setItemDialogError] = useState("");
  const [itemFormValues, setItemFormValues] = useState(getDefaultCollectionItemFormValues());
  useEffect(() => {
    void loadCollection();
  }, [user == null ? void 0 : user.id]);
  const loadCollection = async () => {
    if (!user) {
      setCollection([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await collectionService.getUserCollection();
      setCollection(result.elements);
    } catch (error) {
      console.error("Failed to load collection:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRemove = async (item) => {
    if (!confirm("Remove this edition from your collection?")) {
      return;
    }
    try {
      await collectionService.removeFromCollection(item.id);
      setCollection((previous) => previous.filter((entry2) => entry2.id !== item.id));
    } catch (error) {
      console.error("Failed to remove from collection:", error);
    }
  };
  const handleEdit = async (item) => {
    setEditingItem(item);
    setItemDialogError("");
    setItemDialogLoading(true);
    setIsItemDialogOpen(true);
    try {
      const detail = await collectionService.getCollectionItem(item.id);
      setItemFormValues(mapCollectionItemDetailToFormValues(detail));
    } catch (error) {
      setItemDialogError(error instanceof Error ? error.message : "Collection item could not be loaded");
      setItemFormValues(getDefaultCollectionItemFormValues());
    } finally {
      setItemDialogLoading(false);
    }
  };
  const handleEditSubmit = async (values) => {
    if (!editingItem) {
      return;
    }
    setItemDialogSubmitting(true);
    setItemDialogError("");
    const parsedPrice = values.purchasePrice.trim() ? Number(values.purchasePrice) : void 0;
    try {
      await collectionService.updateCollectionItem({
        id: editingItem.id,
        purchaseDate: values.purchaseDate || void 0,
        purchasePlace: values.purchasePlace || void 0,
        purchasePrice: Number.isFinite(parsedPrice) ? parsedPrice : void 0,
        mediaCondition: values.mediaCondition,
        caseCondition: values.caseCondition,
        comments: values.comments || void 0
      });
      setCollection((previous) => previous.map((item) => item.id === editingItem.id ? {
        ...item,
        mediaCondition: values.mediaCondition,
        caseCondition: values.caseCondition,
        comments: values.comments
      } : item));
      setIsItemDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      setItemDialogError(error instanceof Error ? error.message : "Collection item could not be updated");
    } finally {
      setItemDialogSubmitting(false);
    }
  };
  const filterBySection = (section) => {
    if (section === "all") {
      return collection;
    }
    return collection.filter((item) => item.section === section);
  };
  const filteredCollection = filterBySection(activeTab);
  const stats = {
    total: collection.length,
    uhd4k: collection.filter((item) => item.section === "uhd-4k").length,
    bluray: collection.filter((item) => item.section === "bluray").length,
    dvd: collection.filter((item) => item.section === "dvd").length,
    other: collection.filter((item) => item.section === "other").length
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-card/50 backdrop-blur",
        children: /* @__PURE__ */ jsxs("div", {
          className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-4",
              children: [/* @__PURE__ */ jsx("div", {
                className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10",
                children: /* @__PURE__ */ jsx(Library, {
                  className: "h-8 w-8 text-primary"
                })
              }), /* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("h1", {
                  className: "text-3xl font-bold",
                  children: "My Collection"
                }), /* @__PURE__ */ jsxs("p", {
                  className: "mt-1 text-muted-foreground",
                  children: [stats.total, " ", stats.total === 1 ? "edition" : "editions", " in your vault"]
                })]
              })]
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              children: /* @__PURE__ */ jsxs(Link, {
                to: "/catalog",
                children: [/* @__PURE__ */ jsx(Plus, {
                  className: "mr-2 h-4 w-4"
                }), "Add Editions"]
              })
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Total"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-2xl font-bold",
                children: stats.total
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "4K"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-2xl font-bold",
                children: stats.uhd4k
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "Blu-ray"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-2xl font-bold",
                children: stats.bluray
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-4",
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: "DVD / Other"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-2xl font-bold",
                children: stats.dvd + stats.other
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        children: /* @__PURE__ */ jsxs(Tabs, {
          value: activeTab,
          onValueChange: (value) => setActiveTab(value),
          children: [/* @__PURE__ */ jsxs(TabsList, {
            className: "mb-6",
            children: [/* @__PURE__ */ jsxs(TabsTrigger, {
              value: "all",
              children: ["All (", stats.total, ")"]
            }), /* @__PURE__ */ jsxs(TabsTrigger, {
              value: "uhd-4k",
              children: ["4K (", stats.uhd4k, ")"]
            }), /* @__PURE__ */ jsxs(TabsTrigger, {
              value: "bluray",
              children: ["Blu-ray (", stats.bluray, ")"]
            }), /* @__PURE__ */ jsxs(TabsTrigger, {
              value: "dvd",
              children: ["DVD (", stats.dvd, ")"]
            }), /* @__PURE__ */ jsxs(TabsTrigger, {
              value: "other",
              children: ["Other (", stats.other, ")"]
            })]
          }), loading ? /* @__PURE__ */ jsx("div", {
            className: "flex items-center justify-center py-20",
            children: /* @__PURE__ */ jsx(Loader2, {
              className: "h-8 w-8 animate-spin text-primary"
            })
          }) : filteredCollection.length > 0 ? /* @__PURE__ */ jsx("div", {
            className: "space-y-4",
            children: filteredCollection.map((item) => /* @__PURE__ */ jsx(CollectionItemCard, {
              item,
              onEdit: handleEdit,
              onRemove: handleRemove
            }, item.id))
          }) : /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-center justify-center py-20 text-center",
            children: [/* @__PURE__ */ jsx(Library, {
              className: "mb-4 h-16 w-16 text-muted-foreground"
            }), /* @__PURE__ */ jsx("h3", {
              className: "mb-2 text-xl font-semibold",
              children: activeTab === "all" ? "Your collection is empty" : `No ${activeTab.replace("-", " ")} editions`
            }), /* @__PURE__ */ jsx("p", {
              className: "mb-4 max-w-md text-muted-foreground",
              children: activeTab === "all" ? "Start building your collection by adding editions from the catalog" : `You do not have any editions in the ${activeTab.replace("-", " ")} section`
            }), /* @__PURE__ */ jsx(Button, {
              asChild: true,
              children: /* @__PURE__ */ jsxs(Link, {
                to: "/catalog",
                children: [/* @__PURE__ */ jsx(Plus, {
                  className: "mr-2 h-4 w-4"
                }), "Browse Catalog"]
              })
            })]
          })]
        })
      })]
    }), /* @__PURE__ */ jsx(CollectionItemDialog, {
      open: isItemDialogOpen,
      onOpenChange: (open) => {
        setIsItemDialogOpen(open);
        if (!open) {
          setEditingItem(null);
          setItemDialogError("");
          setItemDialogLoading(false);
        }
      },
      title: "Edit Collection Item",
      description: "Update the collection metadata stored in mv-film-service for this owned edition.",
      submitLabel: "Save changes",
      initialValues: itemFormValues,
      onSubmit: handleEditSubmit,
      submitting: itemDialogSubmitting,
      loading: itemDialogLoading,
      error: itemDialogError
    })]
  });
}
const Collection_default = UNSAFE_withComponentProps(Collection);
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Collection,
  default: Collection_default
}, Symbol.toStringTag, { value: "Module" }));
function AIContent() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    void loadArticles();
  }, []);
  const loadArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const articleData = await iaService.getAllArticles();
      setArticles(articleData);
    } catch (loadError) {
      console.error("Failed to load articles:", loadError);
      setError("Unable to load AI articles right now.");
    } finally {
      setLoading(false);
    }
  };
  const getModelColor = (model) => {
    switch (model) {
      case "Gemini 2.5 Flash":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_42%,rgba(9,9,10,1))]",
        children: /* @__PURE__ */ jsxs("div", {
          className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "mb-4 flex items-center gap-4",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10",
              children: /* @__PURE__ */ jsx(Brain, {
                className: "h-8 w-8 text-primary"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold",
                children: "AI-Generated Content"
              }), /* @__PURE__ */ jsx("p", {
                className: "mt-1 text-muted-foreground",
                children: "Editorial posts generated from newly created editions"
              })]
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-4",
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex items-start gap-3",
              children: [/* @__PURE__ */ jsx(Sparkles, {
                className: "mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
              }), /* @__PURE__ */ jsx("div", {
                className: "text-sm text-foreground",
                children: "New edition creation events trigger article generation in the IA service. This page lists the real posts stored by that backend."
              })]
            })
          })]
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",
        children: loading ? /* @__PURE__ */ jsx("div", {
          className: "flex items-center justify-center py-20",
          children: /* @__PURE__ */ jsx(Loader2, {
            className: "h-8 w-8 animate-spin text-primary"
          })
        }) : error ? /* @__PURE__ */ jsxs("div", {
          className: "rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center",
          children: [/* @__PURE__ */ jsx("h3", {
            className: "text-xl font-semibold",
            children: "Could not load AI content"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2 text-muted-foreground",
            children: error
          }), /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            className: "mt-4",
            onClick: () => void loadArticles(),
            children: "Retry"
          })]
        }) : articles.length > 0 ? /* @__PURE__ */ jsx("div", {
          className: "space-y-6",
          children: articles.map((article) => /* @__PURE__ */ jsx("article", {
            className: "overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
            children: /* @__PURE__ */ jsxs("div", {
              className: "flex flex-col gap-6 p-6 sm:flex-row",
              children: [article.imageUrl ? /* @__PURE__ */ jsx("div", {
                className: "flex-shrink-0",
                children: /* @__PURE__ */ jsx(ImageWithFallback, {
                  src: article.imageUrl,
                  alt: article.title,
                  className: "h-auto w-full rounded-lg object-cover sm:w-40"
                })
              }) : null, /* @__PURE__ */ jsxs("div", {
                className: "min-w-0 flex-1 space-y-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "space-y-2",
                  children: [/* @__PURE__ */ jsxs("div", {
                    className: "flex flex-wrap items-center gap-2",
                    children: [/* @__PURE__ */ jsx(Badge, {
                      variant: "outline",
                      className: getModelColor(article.model),
                      children: article.model
                    }), /* @__PURE__ */ jsx("span", {
                      className: "text-xs text-muted-foreground",
                      children: new Date(article.generatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    }), /* @__PURE__ */ jsx("span", {
                      className: "text-xs text-muted-foreground",
                      children: "•"
                    }), /* @__PURE__ */ jsxs("span", {
                      className: "text-xs text-muted-foreground",
                      children: [article.readTime, " min read"]
                    })]
                  }), /* @__PURE__ */ jsx(Link, {
                    to: `/ai-content/${article.slug}`,
                    className: "block",
                    children: /* @__PURE__ */ jsx("h2", {
                      className: "text-2xl font-bold transition-colors hover:text-primary",
                      children: article.title
                    })
                  })]
                }), /* @__PURE__ */ jsx("p", {
                  className: "line-clamp-3 leading-relaxed text-muted-foreground",
                  children: article.excerpt
                }), /* @__PURE__ */ jsx("div", {
                  className: "flex flex-wrap gap-2",
                  children: article.tags.map((tag) => /* @__PURE__ */ jsx(Badge, {
                    variant: "secondary",
                    className: "text-xs",
                    children: tag
                  }, tag))
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex flex-wrap gap-3",
                  children: [/* @__PURE__ */ jsx(Button, {
                    asChild: true,
                    children: /* @__PURE__ */ jsx(Link, {
                      to: `/ai-content/${article.slug}`,
                      children: "Read article"
                    })
                  }), article.productUrl ? /* @__PURE__ */ jsx(Button, {
                    asChild: true,
                    variant: "outline",
                    children: /* @__PURE__ */ jsxs("a", {
                      href: article.productUrl,
                      target: "_blank",
                      rel: "noreferrer",
                      children: ["Open shop", /* @__PURE__ */ jsx(ExternalLink, {
                        className: "h-4 w-4"
                      })]
                    })
                  }) : null]
                })]
              })]
            })
          }, article.id))
        }) : /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20 text-center",
          children: [/* @__PURE__ */ jsx(Brain, {
            className: "mb-4 h-16 w-16 text-muted-foreground"
          }), /* @__PURE__ */ jsx("h3", {
            className: "mb-2 text-xl font-semibold",
            children: "No articles available"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-muted-foreground",
            children: "Articles generated from edition creation events will appear here."
          })]
        })
      })]
    })]
  });
}
const AIContent_default = UNSAFE_withComponentProps(AIContent);
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AIContent,
  default: AIContent_default
}, Symbol.toStringTag, { value: "Module" }));
function AIArticleDetail() {
  const {
    slug
  } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Article not found.");
      return;
    }
    void loadArticle(slug);
  }, [slug]);
  const loadArticle = async (articleSlug) => {
    setLoading(true);
    setError(null);
    try {
      const articleData = await iaService.getArticleBySlug(articleSlug);
      if (!articleData) {
        setError("Article not found.");
      } else {
        setArticle(articleData);
      }
    } catch (loadError) {
      console.error("Failed to load article:", loadError);
      setError("Unable to load this AI article right now.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("div", {
      className: "min-h-screen bg-background",
      children: /* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-[linear-gradient(135deg,rgba(193,18,31,0.12),rgba(9,9,10,0.96)_42%,rgba(9,9,10,1))]",
        children: /* @__PURE__ */ jsxs("div", {
          className: "mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8",
          children: [/* @__PURE__ */ jsx(Button, {
            asChild: true,
            variant: "ghost",
            className: "mb-4 -ml-4",
            children: /* @__PURE__ */ jsxs(Link, {
              to: "/ai-content",
              children: [/* @__PURE__ */ jsx(ArrowLeft, {
                className: "h-4 w-4"
              }), "Back to AI content"]
            })
          }), loading ? /* @__PURE__ */ jsx("div", {
            className: "flex items-center justify-center py-16",
            children: /* @__PURE__ */ jsx(Loader2, {
              className: "h-8 w-8 animate-spin text-primary"
            })
          }) : error || !article ? /* @__PURE__ */ jsxs("div", {
            className: "rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-2xl font-bold",
              children: "Article unavailable"
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-2 text-muted-foreground",
              children: error ?? "This article could not be found."
            })]
          }) : /* @__PURE__ */ jsxs("div", {
            className: "space-y-6",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex flex-wrap items-center gap-2",
              children: [/* @__PURE__ */ jsx(Badge, {
                variant: "outline",
                className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                children: article.model
              }), /* @__PURE__ */ jsxs(Badge, {
                variant: "secondary",
                children: [article.readTime, " min read"]
              }), /* @__PURE__ */ jsx("span", {
                className: "text-sm text-muted-foreground",
                children: new Date(article.generatedAt).toLocaleDateString()
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-3",
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-4xl font-bold",
                children: article.title
              }), /* @__PURE__ */ jsx("p", {
                className: "max-w-3xl text-muted-foreground",
                children: "Generated automatically from an edition creation event and stored by the IA service."
              })]
            }), article.imageUrl ? /* @__PURE__ */ jsx("div", {
              className: "overflow-hidden rounded-2xl border border-border",
              children: /* @__PURE__ */ jsx(ImageWithFallback, {
                src: article.imageUrl,
                alt: article.title,
                className: "h-[320px] w-full object-cover"
              })
            }) : null, /* @__PURE__ */ jsx(AIArticleBlock, {
              article
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex flex-wrap gap-3",
              children: [article.productUrl ? /* @__PURE__ */ jsx(Button, {
                asChild: true,
                children: /* @__PURE__ */ jsxs("a", {
                  href: article.productUrl,
                  target: "_blank",
                  rel: "noreferrer",
                  children: ["Open edition in shop", /* @__PURE__ */ jsx(ExternalLink, {
                    className: "h-4 w-4"
                  })]
                })
              }) : null, /* @__PURE__ */ jsx(Button, {
                asChild: true,
                variant: "outline",
                children: /* @__PURE__ */ jsxs(Link, {
                  to: "/ai-content",
                  children: [/* @__PURE__ */ jsx(Sparkles, {
                    className: "h-4 w-4"
                  }), "More AI articles"]
                })
              })]
            })]
          })]
        })
      })
    })]
  });
}
const AIArticleDetail_default = UNSAFE_withComponentProps(AIArticleDetail);
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AIArticleDetail,
  default: AIArticleDetail_default
}, Symbol.toStringTag, { value: "Module" }));
function RankingCard({ entry: entry2, highlight = false }) {
  const getTrendIcon = () => {
    if (entry2.change > 0) {
      return /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-green-500" });
    } else if (entry2.change < 0) {
      return /* @__PURE__ */ jsx(TrendingDown, { className: "h-4 w-4 text-red-500" });
    }
    return /* @__PURE__ */ jsx(Minus, { className: "h-4 w-4 text-muted-foreground" });
  };
  const getTrendText = () => {
    if (entry2.change > 0) return `+${entry2.change}`;
    if (entry2.change < 0) return entry2.change;
    return "-";
  };
  const getRankColor = () => {
    if (entry2.rank === 1) return "text-yellow-500";
    if (entry2.rank === 2) return "text-gray-400";
    if (entry2.rank === 3) return "text-amber-700";
    return "text-muted-foreground";
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-primary/50 ${highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
          /* @__PURE__ */ jsxs("span", { className: `text-2xl font-bold ${getRankColor()}`, children: [
            "#",
            entry2.rank
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
            getTrendIcon(),
            /* @__PURE__ */ jsx("span", { className: entry2.change > 0 ? "text-green-500" : entry2.change < 0 ? "text-red-500" : "text-muted-foreground", children: getTrendText() })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Avatar, { className: "h-12 w-12 border-2 border-border", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: entry2.avatar, alt: entry2.username }),
          /* @__PURE__ */ jsx(AvatarFallback, { children: entry2.username.charAt(0) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium truncate group-hover:text-primary transition-colors", children: entry2.username }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            entry2.score.toLocaleString(),
            " points"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex flex-col items-end gap-1 min-w-[100px]", children: [
          /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: entry2.score.toLocaleString() }),
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full rounded-full bg-secondary overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all",
              style: { width: `${Math.min(entry2.score / 2e4 * 100, 100)}%` }
            }
          ) })
        ] })
      ]
    }
  );
}
function UserBadge({ badge, unlocked = false }) {
  const getRarityColor = () => {
    switch (badge.rarity) {
      case "legendary":
        return "from-yellow-500 to-orange-500";
      case "epic":
        return "from-purple-500 to-pink-500";
      case "rare":
        return "from-blue-500 to-cyan-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative group rounded-xl border p-4 transition-all ${unlocked ? "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10" : "border-border/50 bg-card/50 opacity-60"}`,
      children: [
        !unlocked && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm", children: /* @__PURE__ */ jsx(Lock, { className: "h-6 w-6 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx("div", { className: `mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${getRarityColor()} text-3xl`, children: badge.icon }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: badge.name }),
            /* @__PURE__ */ jsx(
              Badge,
              {
                variant: "outline",
                className: `text-xs capitalize ${badge.rarity === "legendary" ? "border-yellow-500 text-yellow-500" : badge.rarity === "epic" ? "border-purple-500 text-purple-500" : badge.rarity === "rare" ? "border-blue-500 text-blue-500" : "border-gray-500 text-gray-500"}`,
                children: badge.rarity
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: badge.description }),
          unlocked && badge.unlockedAt && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground pt-2", children: [
            "Unlocked ",
            new Date(badge.unlockedAt).toLocaleDateString()
          ] })
        ] })
      ]
    }
  );
}
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ProgressPrimitive.Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        ProgressPrimitive.Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
function Ranking() {
  const user = authService.getCurrentUser();
  const userId = (user == null ? void 0 : user.id) || "1";
  const [leaderboard, setLeaderboard] = useState([]);
  const [userScore, setUserScore] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadRankingData();
  }, [userId]);
  const loadRankingData = async () => {
    setLoading(true);
    try {
      const [leaderboardData, scoreData] = await Promise.all([rankingService.getLeaderboard(20), rankingService.getUserScore(userId)]);
      setLeaderboard(leaderboardData);
      setUserScore(scoreData);
    } catch (error) {
      console.error("Failed to load ranking data:", error);
    } finally {
      setLoading(false);
    }
  };
  const levelProgress = userScore ? rankingService.getNextLevelProgress(userScore.totalScore) : null;
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-[linear-gradient(135deg,rgba(140,106,67,0.22),rgba(9,9,10,0.96)_46%,rgba(9,9,10,1))]",
        children: /* @__PURE__ */ jsx("div", {
          className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-4",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8c6a43]/15",
              children: /* @__PURE__ */ jsx(Trophy, {
                className: "h-8 w-8 text-[#8c6a43]"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold",
                children: "Global Leaderboard"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground mt-1",
                children: "Compete with movie enthusiasts worldwide"
              })]
            })]
          })
        })
      }), loading ? /* @__PURE__ */ jsx("div", {
        className: "flex items-center justify-center py-20",
        children: /* @__PURE__ */ jsx(Loader2, {
          className: "h-8 w-8 animate-spin text-primary"
        })
      }) : /* @__PURE__ */ jsx("div", {
        className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12",
        children: /* @__PURE__ */ jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-3 gap-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "lg:col-span-2 space-y-4",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-2xl font-bold mb-6",
              children: "Top Rankings"
            }), leaderboard.map((entry2) => /* @__PURE__ */ jsx(RankingCard, {
              entry: entry2,
              highlight: entry2.userId === (user == null ? void 0 : user.id)
            }, entry2.userId))]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-6",
            children: [userScore && /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-primary bg-primary/5 p-6 space-y-6",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold",
                  children: ["#", userScore.rank]
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("h3", {
                    className: "font-semibold",
                    children: "Your Rank"
                  }), /* @__PURE__ */ jsxs("p", {
                    className: "text-sm text-muted-foreground",
                    children: ["Level ", userScore.level, " Collector"]
                  })]
                })]
              }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
                className: "space-y-4",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-sm text-muted-foreground",
                    children: "Total Score"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-semibold",
                    children: userScore.totalScore.toLocaleString()
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-sm text-muted-foreground",
                    children: "Movies Watched"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-semibold",
                    children: userScore.moviesWatched
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-sm text-muted-foreground",
                    children: "Reviews Written"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "font-semibold",
                    children: userScore.reviewsWritten
                  })]
                })]
              }), /* @__PURE__ */ jsx(Separator, {}), levelProgress && /* @__PURE__ */ jsxs("div", {
                className: "space-y-2",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex items-center justify-between text-sm",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-muted-foreground",
                    children: "Level Progress"
                  }), /* @__PURE__ */ jsxs("span", {
                    className: "font-medium",
                    children: ["Level ", levelProgress.current, " → ", levelProgress.next]
                  })]
                }), /* @__PURE__ */ jsx(Progress, {
                  value: levelProgress.percentage,
                  className: "h-3"
                }), /* @__PURE__ */ jsxs("p", {
                  className: "text-xs text-muted-foreground text-center",
                  children: [levelProgress.percentage.toFixed(0), "% complete"]
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-6 space-y-4",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-2",
                children: [/* @__PURE__ */ jsx(Award, {
                  className: "h-5 w-5 text-primary"
                }), /* @__PURE__ */ jsx("h3", {
                  className: "font-semibold",
                  children: "Your Badges"
                })]
              }), userScore && userScore.badges.length > 0 ? /* @__PURE__ */ jsx("div", {
                className: "grid grid-cols-1 gap-3",
                children: userScore.badges.map((badge) => /* @__PURE__ */ jsx(UserBadge, {
                  badge,
                  unlocked: true
                }, badge.id))
              }) : /* @__PURE__ */ jsxs("div", {
                className: "text-center py-8 text-muted-foreground",
                children: [/* @__PURE__ */ jsx(Star, {
                  className: "h-12 w-12 mx-auto mb-3 opacity-50"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm",
                  children: "No badges earned yet"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "rounded-xl border border-border bg-card p-6 space-y-3",
              children: [/* @__PURE__ */ jsxs("h3", {
                className: "font-semibold flex items-center gap-2",
                children: [/* @__PURE__ */ jsx(Trophy, {
                  className: "h-5 w-5 text-primary"
                }), "How Points Work"]
              }), /* @__PURE__ */ jsxs("div", {
                className: "space-y-2 text-sm text-muted-foreground",
                children: [/* @__PURE__ */ jsxs("div", {
                  className: "flex justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: "Watch a movie"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-foreground font-medium",
                    children: "+10 pts"
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: "Write a review"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-foreground font-medium",
                    children: "+25 pts"
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: "Add to collection"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-foreground font-medium",
                    children: "+5 pts"
                  })]
                }), /* @__PURE__ */ jsxs("div", {
                  className: "flex justify-between",
                  children: [/* @__PURE__ */ jsx("span", {
                    children: "Daily login"
                  }), /* @__PURE__ */ jsx("span", {
                    className: "text-foreground font-medium",
                    children: "+2 pts"
                  })]
                })]
              })]
            })]
          })]
        })
      })]
    })]
  });
}
const Ranking_default = UNSAFE_withComponentProps(Ranking);
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Ranking,
  default: Ranking_default
}, Symbol.toStringTag, { value: "Module" }));
function Settings() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState((user == null ? void 0 : user.emailVerified) || false);
  const handleVerifyEmail = async () => {
    setVerifying(true);
    try {
      await authService.verifyEmail();
      setVerified(true);
    } catch (error) {
      console.error("Failed to verify email:", error);
    } finally {
      setVerifying(false);
    }
  };
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };
  if (!user) {
    navigate("/login");
    return null;
  }
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("div", {
      className: "min-h-screen bg-background",
      children: [/* @__PURE__ */ jsx("div", {
        className: "border-b border-border bg-card/50 backdrop-blur",
        children: /* @__PURE__ */ jsx("div", {
          className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-4",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10",
              children: /* @__PURE__ */ jsx(Settings$1, {
                className: "h-8 w-8 text-primary"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-3xl font-bold",
                children: "Settings"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-muted-foreground mt-1",
                children: "Manage your account and preferences"
              })]
            })]
          })
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8",
        children: [/* @__PURE__ */ jsxs("section", {
          className: "rounded-xl border border-border bg-card p-6 space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(User, {
              className: "h-5 w-5 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold",
              children: "Profile Information"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-6",
            children: [/* @__PURE__ */ jsxs(Avatar, {
              className: "h-24 w-24 border-4 border-border",
              children: [/* @__PURE__ */ jsx(AvatarImage, {
                src: user.avatar,
                alt: user.name
              }), /* @__PURE__ */ jsx(AvatarFallback, {
                className: "text-2xl",
                children: user.name.charAt(0)
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-1",
              children: [/* @__PURE__ */ jsx("h3", {
                className: "text-lg font-semibold",
                children: user.name
              }), /* @__PURE__ */ jsx("p", {
                className: "text-sm text-muted-foreground",
                children: user.email
              }), /* @__PURE__ */ jsx(Badge, {
                variant: "outline",
                className: "mt-2",
                children: user.role
              })]
            })]
          }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 gap-6",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "name",
                children: "Full Name"
              }), /* @__PURE__ */ jsx(Input, {
                id: "name",
                defaultValue: user.name,
                disabled: true
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "space-y-2",
              children: [/* @__PURE__ */ jsx(Label, {
                htmlFor: "email",
                children: "Email Address"
              }), /* @__PURE__ */ jsx(Input, {
                id: "email",
                type: "email",
                defaultValue: user.email,
                disabled: true
              })]
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-2",
            children: [/* @__PURE__ */ jsx(Label, {
              children: "Member Since"
            }), /* @__PURE__ */ jsx(Input, {
              value: new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }),
              disabled: true
            })]
          })]
        }), /* @__PURE__ */ jsxs("section", {
          className: "rounded-xl border border-border bg-card p-6 space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Mail, {
              className: "h-5 w-5 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold",
              children: "Email Verification"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4",
            children: [/* @__PURE__ */ jsx("div", {
              className: "flex items-center gap-3",
              children: verified ? /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10",
                  children: /* @__PURE__ */ jsx(CheckCircle2, {
                    className: "h-5 w-5 text-green-500"
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("p", {
                    className: "font-medium",
                    children: "Email Verified"
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Your email address has been verified"
                  })]
                })]
              }) : /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsx("div", {
                  className: "flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10",
                  children: /* @__PURE__ */ jsx(XCircle, {
                    className: "h-5 w-5 text-yellow-500"
                  })
                }), /* @__PURE__ */ jsxs("div", {
                  children: [/* @__PURE__ */ jsx("p", {
                    className: "font-medium",
                    children: "Email Not Verified"
                  }), /* @__PURE__ */ jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: "Verify your email to unlock all features"
                  })]
                })]
              })
            }), !verified && /* @__PURE__ */ jsx(Button, {
              onClick: handleVerifyEmail,
              disabled: verifying,
              children: verifying ? /* @__PURE__ */ jsxs(Fragment, {
                children: [/* @__PURE__ */ jsx(Loader2, {
                  className: "mr-2 h-4 w-4 animate-spin"
                }), "Verifying..."]
              }) : "Verify Now"
            })]
          })]
        }), /* @__PURE__ */ jsxs("section", {
          className: "rounded-xl border border-border bg-card p-6 space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-2",
            children: [/* @__PURE__ */ jsx(Shield, {
              className: "h-5 w-5 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold",
              children: "Security & Access"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: "Account Role"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Your current access level in the system"
                })]
              }), /* @__PURE__ */ jsx(Badge, {
                variant: "outline",
                className: "text-sm px-3 py-1",
                children: user.role
              })]
            }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: "Password"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Last updated: Never"
                })]
              }), /* @__PURE__ */ jsx(Button, {
                variant: "outline",
                disabled: true,
                children: "Change Password"
              })]
            }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: "Two-Factor Authentication"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Add an extra layer of security"
                })]
              }), /* @__PURE__ */ jsx(Button, {
                variant: "outline",
                disabled: true,
                children: "Enable 2FA"
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("section", {
          className: "rounded-xl border border-destructive/30 bg-destructive/5 p-6 space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-xl font-semibold text-destructive",
              children: "Danger Zone"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-sm text-muted-foreground mt-1",
              children: "Irreversible and destructive actions"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: "Sign Out"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Sign out of your account on this device"
                })]
              }), /* @__PURE__ */ jsxs(Button, {
                variant: "destructive",
                onClick: handleLogout,
                children: [/* @__PURE__ */ jsx(LogOut, {
                  className: "mr-2 h-4 w-4"
                }), "Sign Out"]
              })]
            }), /* @__PURE__ */ jsx(Separator, {}), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "font-medium",
                  children: "Delete Account"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: "Permanently delete your account and all data"
                })]
              }), /* @__PURE__ */ jsx(Button, {
                variant: "outline",
                className: "text-destructive border-destructive/30",
                disabled: true,
                children: "Delete Account"
              })]
            })]
          })]
        })]
      })]
    })]
  });
}
const Settings_default = UNSAFE_withComponentProps(Settings);
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Settings,
  default: Settings_default
}, Symbol.toStringTag, { value: "Module" }));
const NotFound = UNSAFE_withComponentProps(function NotFound2() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-background",
    children: /* @__PURE__ */ jsxs("div", {
      className: "text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-4xl font-bold mb-4",
        children: "404"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-muted-foreground mb-6",
        children: "Page not found"
      }), /* @__PURE__ */ jsx("a", {
        href: "/",
        className: "text-primary hover:underline",
        children: "Return to Home"
      })]
    })
  });
});
const route16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-rA_F2ttg.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/index-Bzv9XdRk.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/root-D6DYg1kQ.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/index-Bzv9XdRk.js"], "css": ["/assets/root-BTLglgmt.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Landing": { "id": "app/pages/Landing", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Landing-CwUHUp08.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/carousel-C0MlUYWT.js", "/assets/auth.service-CBrV3YtK.js", "/assets/button-ESa0N7c0.js", "/assets/badge-B5g8Ss1_.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/utils-CEYfcJUd.js", "/assets/sparkles-CH2qONMG.js", "/assets/trending-up-iO4vtaNH.js", "/assets/star-CI7aJQYv.js", "/assets/arrow-left-CguzLQK3.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Login": { "id": "app/pages/Login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Login-D1RUD7_D.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js", "/assets/button-ESa0N7c0.js", "/assets/input-C4eaHh5l.js", "/assets/label-DCkJNjVM.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Register": { "id": "app/pages/Register", "parentId": "root", "path": "register", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Register-DtCzmH-t.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js", "/assets/button-ESa0N7c0.js", "/assets/input-C4eaHh5l.js", "/assets/label-DCkJNjVM.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/ResetPassword": { "id": "app/pages/ResetPassword", "parentId": "root", "path": "reset-password", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/ResetPassword-BbnCHlxa.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js", "/assets/button-ESa0N7c0.js", "/assets/input-C4eaHh5l.js", "/assets/label-DCkJNjVM.js", "/assets/utils-CEYfcJUd.js", "/assets/circle-check-DEgUszJd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/components/ProtectedRouteLayout": { "id": "app/components/ProtectedRouteLayout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/ProtectedRouteLayout-B2kx6352.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Home": { "id": "app/pages/Home", "parentId": "app/components/ProtectedRouteLayout", "path": "home", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Home-CwxMs290.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js", "/assets/ranking.service-0e-SDHzC.js", "/assets/ia.service-MIWK3q4G.js", "/assets/carousel-C0MlUYWT.js", "/assets/Navbar-DLIfqzBH.js", "/assets/AIArticleBlock-jkfjhxKq.js", "/assets/button-ESa0N7c0.js", "/assets/badge-B5g8Ss1_.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/sparkles-CH2qONMG.js", "/assets/trending-up-iO4vtaNH.js", "/assets/utils-CEYfcJUd.js", "/assets/brain-B9j_wCpl.js", "/assets/star-CI7aJQYv.js", "/assets/arrow-left-CguzLQK3.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Catalog": { "id": "app/pages/Catalog", "parentId": "app/components/ProtectedRouteLayout", "path": "catalog", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Catalog-CYjj1ab5.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/Navbar-DLIfqzBH.js", "/assets/input-C4eaHh5l.js", "/assets/button-ESa0N7c0.js", "/assets/search-t-eoAroi.js", "/assets/x-CifY1JmM.js", "/assets/badge-B5g8Ss1_.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/calendar-NBRkC3VQ.js", "/assets/catalog.service-CieZ9DKe.js", "/assets/auth.service-CBrV3YtK.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/AddRelease": { "id": "app/pages/AddRelease", "parentId": "app/components/ProtectedRouteLayout", "path": "catalog/releases/new", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/AddRelease-CtIyhEis.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/Navbar-DLIfqzBH.js", "/assets/input-C4eaHh5l.js", "/assets/button-ESa0N7c0.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/catalog.service-CieZ9DKe.js", "/assets/textarea-DbjzM2M-.js", "/assets/auth.service-CBrV3YtK.js", "/assets/search-t-eoAroi.js", "/assets/circle-check-DEgUszJd.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/ReleaseDetail": { "id": "app/pages/ReleaseDetail", "parentId": "app/components/ProtectedRouteLayout", "path": "releases/:slug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/ReleaseDetail-HdvnI1Ur.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/Navbar-DLIfqzBH.js", "/assets/button-ESa0N7c0.js", "/assets/badge-B5g8Ss1_.js", "/assets/separator-BoatyP75.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/catalog.service-CieZ9DKe.js", "/assets/CollectionItemDialog-DbYA4WO5.js", "/assets/auth.service-CBrV3YtK.js", "/assets/arrow-left-CguzLQK3.js", "/assets/x-CifY1JmM.js", "/assets/textarea-DbjzM2M-.js", "/assets/calendar-NBRkC3VQ.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js", "/assets/input-C4eaHh5l.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/MovieDetail": { "id": "app/pages/MovieDetail", "parentId": "app/components/ProtectedRouteLayout", "path": "movie/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/MovieDetail-B2Viwt_-.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/ia.service-MIWK3q4G.js", "/assets/Navbar-DLIfqzBH.js", "/assets/AIArticleBlock-jkfjhxKq.js", "/assets/button-ESa0N7c0.js", "/assets/badge-B5g8Ss1_.js", "/assets/separator-BoatyP75.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/auth.service-CBrV3YtK.js", "/assets/calendar-NBRkC3VQ.js", "/assets/star-CI7aJQYv.js", "/assets/user-RwXd0A7H.js", "/assets/sparkles-CH2qONMG.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Collection": { "id": "app/pages/Collection", "parentId": "app/components/ProtectedRouteLayout", "path": "collection", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Collection-IwCc6ogi.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/CollectionItemDialog-DbYA4WO5.js", "/assets/auth.service-CBrV3YtK.js", "/assets/Navbar-DLIfqzBH.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/badge-B5g8Ss1_.js", "/assets/button-ESa0N7c0.js", "/assets/x-CifY1JmM.js", "/assets/index-BC5t378G.js", "/assets/utils-CEYfcJUd.js", "/assets/catalog.service-CieZ9DKe.js", "/assets/input-C4eaHh5l.js", "/assets/textarea-DbjzM2M-.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/AIContent": { "id": "app/pages/AIContent", "parentId": "app/components/ProtectedRouteLayout", "path": "ai-content", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/AIContent-zVm6Ltk_.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/ia.service-MIWK3q4G.js", "/assets/Navbar-DLIfqzBH.js", "/assets/badge-B5g8Ss1_.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/button-ESa0N7c0.js", "/assets/brain-B9j_wCpl.js", "/assets/sparkles-CH2qONMG.js", "/assets/auth.service-CBrV3YtK.js", "/assets/external-link-DpDaukak.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/AIArticleDetail": { "id": "app/pages/AIArticleDetail", "parentId": "app/components/ProtectedRouteLayout", "path": "ai-content/:slug", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/AIArticleDetail-BCfyXWkA.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/Navbar-DLIfqzBH.js", "/assets/button-ESa0N7c0.js", "/assets/badge-B5g8Ss1_.js", "/assets/ImageWithFallback-BTBg3PWe.js", "/assets/AIArticleBlock-jkfjhxKq.js", "/assets/ia.service-MIWK3q4G.js", "/assets/arrow-left-CguzLQK3.js", "/assets/auth.service-CBrV3YtK.js", "/assets/external-link-DpDaukak.js", "/assets/sparkles-CH2qONMG.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Ranking": { "id": "app/pages/Ranking", "parentId": "app/components/ProtectedRouteLayout", "path": "ranking", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Ranking-O5Wvbiib.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/ranking.service-0e-SDHzC.js", "/assets/auth.service-CBrV3YtK.js", "/assets/Navbar-DLIfqzBH.js", "/assets/trending-up-iO4vtaNH.js", "/assets/badge-B5g8Ss1_.js", "/assets/index-BC5t378G.js", "/assets/utils-CEYfcJUd.js", "/assets/separator-BoatyP75.js", "/assets/star-CI7aJQYv.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/Settings": { "id": "app/pages/Settings", "parentId": "app/components/ProtectedRouteLayout", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/Settings-CN62E1Eg.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js", "/assets/auth.service-CBrV3YtK.js", "/assets/Navbar-DLIfqzBH.js", "/assets/button-ESa0N7c0.js", "/assets/input-C4eaHh5l.js", "/assets/label-DCkJNjVM.js", "/assets/separator-BoatyP75.js", "/assets/badge-B5g8Ss1_.js", "/assets/user-RwXd0A7H.js", "/assets/circle-check-DEgUszJd.js", "/assets/utils-CEYfcJUd.js", "/assets/index-BC5t378G.js", "/assets/index-Bzv9XdRk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "app/pages/NotFound": { "id": "app/pages/NotFound", "parentId": "root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasDefaultExport": true, "hasErrorBoundary": false, "module": "/assets/NotFound-CZl5r0Rb.js", "imports": ["/assets/chunk-QFMPRPBF-BfFoP_Qc.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-4eb5dd65.js", "version": "4eb5dd65", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_passThroughRequests": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "unstable_previewServerPrerendering": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "app/pages/Landing": {
    id: "app/pages/Landing",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "app/pages/Login": {
    id: "app/pages/Login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "app/pages/Register": {
    id: "app/pages/Register",
    parentId: "root",
    path: "register",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "app/pages/ResetPassword": {
    id: "app/pages/ResetPassword",
    parentId: "root",
    path: "reset-password",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "app/components/ProtectedRouteLayout": {
    id: "app/components/ProtectedRouteLayout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "app/pages/Home": {
    id: "app/pages/Home",
    parentId: "app/components/ProtectedRouteLayout",
    path: "home",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "app/pages/Catalog": {
    id: "app/pages/Catalog",
    parentId: "app/components/ProtectedRouteLayout",
    path: "catalog",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "app/pages/AddRelease": {
    id: "app/pages/AddRelease",
    parentId: "app/components/ProtectedRouteLayout",
    path: "catalog/releases/new",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "app/pages/ReleaseDetail": {
    id: "app/pages/ReleaseDetail",
    parentId: "app/components/ProtectedRouteLayout",
    path: "releases/:slug",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "app/pages/MovieDetail": {
    id: "app/pages/MovieDetail",
    parentId: "app/components/ProtectedRouteLayout",
    path: "movie/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "app/pages/Collection": {
    id: "app/pages/Collection",
    parentId: "app/components/ProtectedRouteLayout",
    path: "collection",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "app/pages/AIContent": {
    id: "app/pages/AIContent",
    parentId: "app/components/ProtectedRouteLayout",
    path: "ai-content",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "app/pages/AIArticleDetail": {
    id: "app/pages/AIArticleDetail",
    parentId: "app/components/ProtectedRouteLayout",
    path: "ai-content/:slug",
    index: void 0,
    caseSensitive: void 0,
    module: route13
  },
  "app/pages/Ranking": {
    id: "app/pages/Ranking",
    parentId: "app/components/ProtectedRouteLayout",
    path: "ranking",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "app/pages/Settings": {
    id: "app/pages/Settings",
    parentId: "app/components/ProtectedRouteLayout",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  },
  "app/pages/NotFound": {
    id: "app/pages/NotFound",
    parentId: "root",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route16
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
