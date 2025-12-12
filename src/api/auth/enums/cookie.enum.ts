export enum Cookies {
	ACCESS_TOKEN = "___Auth.access-token",
}
export const CookieOptionals = {
	httpOnly: true,
	secure: true,
	sameSite: "none" as const,
	maxAge: 864000,
};
