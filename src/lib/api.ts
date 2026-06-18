import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:8000'
})

export interface UserFormData {
    nom: string
    prenom: string
    mail: string
    birth: string
    ville: string
    cp: string
}

export interface CreatedUser {
    id: number
    nom: string
    prenom: string
    mail: string
    birth: string
    ville: string
    cp: string
}

export interface PublicUser {
    id: number
    nom: string
    prenom: string
    ville: string
}

export interface PrivateUser extends PublicUser {
    mail: string
    birth: string
    cp: string
    is_admin: number
}

export interface LoginResponse {
    token: string
    is_admin: boolean
    mail: string
}

export async function countUsers(): Promise<number> {
    const response = await api.get('/users')
    return response.data.length
}

export async function getUsers(): Promise<PublicUser[]> {
    const response = await api.get('/users')
    return response.data
}

export async function addUser(userData: UserFormData): Promise<CreatedUser> {
    const response = await api.post('/users', userData)
    return response.data
}

export async function login(mail: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/login', { mail, password })
    return response.data
}

export async function getUsersDetails(token: string): Promise<PrivateUser[]> {
    const response = await api.get('/users/details', {
        headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
}

export async function deleteUser(id: number, token: string): Promise<void> {
    await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
}
