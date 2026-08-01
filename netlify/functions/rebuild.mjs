const BUILD_HOOK = "https://api.netlify.com/build_hooks/6a6e1b9b9f15e873079eed94";

export default async (req) => {
    await fetch(BUILD_HOOK, { method: 'POST' }).then(response => {
        console.log('Build hook response:', response)
    });

    return {
        statusCode: 200
    };
}
