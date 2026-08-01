const BUILD_HOOK = "https://api.netlify.com/build_hooks/6a6e1b9b9f15e873079eed94";

export const config = { path: "/api/email-update" };

export default async (req) => {
    const auth = await req.headers.get("Authorization");
    if (auth !== `Bearer ${process.env.EMAIL_UPDATE_AUTH_KEY}`) {
        return Response.json({}, { status: 401, statusText: "Unauthorized" });
    }

    const {data: {attachments, from}} = await req.json();
    console.log(from, attachments);

    return Response.json({ received: true });
};

