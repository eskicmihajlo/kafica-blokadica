import API from "../api/api"


export const loginUser = async (email, password) =>
{

    const response = await API.post("/auth/login", {
        email, password
    })


    return response.data;

}


export const registerUser = async (email, password, displayName) =>
{

    const response = await API.post("/auth/register", 
        {
            email,
            password,
            displayName
        }
    );

    return response.data;

}