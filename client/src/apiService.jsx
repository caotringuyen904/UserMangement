import axios from 'axios';

// Define base URL once
const base_url = 'http://user-mangement-api.vercel.app'; // Adjust this if needed for production or development

export const signup = (data) => {
    console.log(data);
    return axios.post(`${base_url}/signup`, data);
};

export const getUserAndPagination = (pageSize, pageIndex) => {
    return axios.get(`${base_url}/users-pagination?pageSize=${pageSize}&pageIndex=${pageIndex}`);
};

export const getUserList = () => {
    return axios.get(`${base_url}/userlist`);
};

export const deleteUser = (id) => {
    console.log(id);
    return axios.delete(`${base_url}/user/${id}`);
};

// Update exportCSV to use axios and GET method
export const exportCSV = async (userIds) => {
    console.log("userIds: ", userIds);

    const userIdsParam = userIds.join(','); // Convert array of IDs to a comma-separated string
    console.log("userIdsParam: ", userIdsParam);
    const response = await axios.get(`${base_url}/users?ids=${userIdsParam}`, {
        responseType: 'blob', // Important for handling binary data
    });

    if (response.status !== 200) {
        throw new Error('Failed to export CSV');
    }

    const url = window.URL.createObjectURL(new Blob([response.data])); // Create a URL for the blob
    const link = document.createElement('a'); // Create a link element
    link.href = url;
    link.setAttribute('download', 'selected_users.txt'); // Set the download attribute with a filename
    document.body.appendChild(link);
    link.click(); // Simulate a click to download the file
    link.remove(); // Clean up
};
