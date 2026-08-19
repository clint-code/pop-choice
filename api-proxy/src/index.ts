/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

//the secrets the Worker can use.
export interface Env {
	OPENAI_API_KEY: string;
	SUPABASE_API_KEY: string;
	SUPABASE_URL: string;
	THEMOVIEDB_API_KEY: string;
	ALLOWED_ORIGIN?: string;
}

const stripQuotes = (value: string) => value.trim().replace(/^["']|["']$/g, "");

const corsHeaders = (origin: string) => ({
	"Access-Control-Allow-Origin": origin,
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
	"Access-Control-Max-Age": "86400",
	Vary: "Origin",
});

const supabaseHeaders = (env: Env, extra: Record<string, string> = {}) => ({
	apikey: env.SUPABASE_API_KEY,
	Authorization: `Bearer ${env.SUPABASE_API_KEY}`,
	"Content-Type": "application/json",
	...extra,
});

function resolveAllowedOrigin(request: Request): string {
	const requestOrigin = stripQuotes(request.headers.get("Origin") ?? "");
	return requestOrigin || "*";
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const allowedOrigin = resolveAllowedOrigin(request);

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(allowedOrigin),
			});
		}
		const url = new URL(request.url);

		try {
			/**Each route: Receives the request from your React app (no API key)
			 * Adds the real key from env
			 * Calls OpenAI or TMDB and
			 * Sends the response back unchanged
			 */

			// POST /api/openai/embeddings
			// Replaces: openai.embeddings.create(...) in config.js / services
			if (url.pathname === "/api/openai/embeddings" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch("https://api.openai.com/v1/embeddings", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${env.OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});

				return jsonResponse(response, allowedOrigin);
			}

			// POST /api/openai/chat/completions
			// Replaces: fetch("https://api.openai.com/v1/chat/completions", ...) in your services
			if (url.pathname === "/api/openai/chat/completions" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch("https://api.openai.com/v1/chat/completions", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${env.OPENAI_API_KEY}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify(body),
				});

				return jsonResponse(response, allowedOrigin);
			}

			// GET /api/tmdb/authentication
			// Replaces: StretchGoal.jsx / loginToMovieDBApi.jsx TMDB Bearer check
			if (url.pathname === "/api/tmdb/authentication" && request.method === "GET") {
				const response = await fetch("https://api.themoviedb.org/3/authentication", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${env.THEMOVIEDB_API_KEY}`,
						"Content-Type": "application/json",
					},
				});

				return jsonResponse(response, allowedOrigin);
			}

			// GET /api/tmdb/search/movie?query=...&primary_release_year=...
			// Replaces: getMoviePoster.jsx
			if (url.pathname === "/api/tmdb/search/movie" && request.method === "GET") {
				const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");
				tmdbUrl.search = url.search;
				const response = await fetch(tmdbUrl.toString(), {
					method: "GET",
					headers: {
						Authorization: `Bearer ${env.THEMOVIEDB_API_KEY}`,
						"Content-Type": "application/json",
					},
				});

				return jsonResponse(response, allowedOrigin);
			}

			const supabaseUrl = env.SUPABASE_URL.replace(/\/$/, "");
			// GET /api/supabase/movies
			// Replaces: supabase.from('movienight_choice').select('title, year_of_release')
			if (url.pathname === "/api/supabase/movies" && request.method === "GET") {
				const response = await fetch(
					`${supabaseUrl}/rest/v1/movienight_choice?select=title,year_of_release`,
					{
						method: "GET",
						headers: supabaseHeaders(env),
					}
				);

				return jsonResponse(response, allowedOrigin);
			}

			// POST /api/supabase/movies
			// Replaces: supabase.from('movienight_choice').insert(movieData)
			if (url.pathname === "/api/supabase/movies" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch(`${supabaseUrl}/rest/v1/movienight_choice`, {
					method: "POST",
					headers: supabaseHeaders(env, { Prefer: "return=minimal" }),
					body: JSON.stringify(body),
				});
				return jsonResponse(response, allowedOrigin);
			}
			// POST /api/supabase/match
			// Replaces: supabase.rpc('match_movienight_choice', ...)
			if (url.pathname === "/api/supabase/match" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch(
					`${supabaseUrl}/rest/v1/rpc/match_movienight_choice`,
					{
						method: "POST",
						headers: supabaseHeaders(env),
						body: JSON.stringify(body),
					}
				);
				return jsonResponse(response, allowedOrigin);
			}
			// POST /api/supabase/popchoice-movies
			// Replaces: supabase.from('popchoice_movies').upsert(rows, { onConflict: ['title'] })
			if (url.pathname === "/api/supabase/popchoice-movies" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch(
					`${supabaseUrl}/rest/v1/popchoice_movies?on_conflict=title`,
					{
						method: "POST",
						headers: supabaseHeaders(env, {
							Prefer: "resolution=merge-duplicates,return=minimal",
						}),
						body: JSON.stringify(body),
					}
				);
				return jsonResponse(response, allowedOrigin);
			}
			// POST /api/supabase/match-popchoice
			// Replaces: supabase.rpc('match_popchoice_movies', ...)
			if (url.pathname === "/api/supabase/match-popchoice" && request.method === "POST") {
				const body = await request.json();
				const response = await fetch(
					`${supabaseUrl}/rest/v1/rpc/match_popchoice_movies`,
					{
						method: "POST",
						headers: supabaseHeaders(env),
						body: JSON.stringify(body),
					}
				);
				return jsonResponse(response, allowedOrigin);
			}

			return new Response("Not Found", { status: 404, headers: corsHeaders(allowedOrigin) });

		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			return new Response(JSON.stringify({ error: message }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					...corsHeaders(allowedOrigin),
				},
			});
		}
	},
};

/**
 * A small helper that forwards status code and JSON body 
 * from OpenAI/TMDB to your app, with CORS headers attached.
 */
async function jsonResponse(upstream: Response, allowedOrigin: string): Promise<Response> {
	const data = await upstream.text();

	return new Response(data, {
		status: upstream.status,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders(allowedOrigin),
		},
	});
}
