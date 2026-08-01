const BUILD_HOOK = "https://api.netlify.com/build_hooks/6a6e1b9b9f15e873079eed94";

export const config = { path: "/api/email-update" };

export default async (req) => {
    const auth = req.headers.authorization;
    const payload = await req.json();
    console.log(auth, payload);

    return Response.json({ received: true });
};

