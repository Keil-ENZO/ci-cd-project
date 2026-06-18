import { countUsers, addUser, api } from '../../lib/api';

jest.mock('axios', () => {
    const mockInstance = { get: jest.fn(), post: jest.fn() };
    const mockCreate = jest.fn(() => mockInstance);
    return { default: { create: mockCreate }, create: mockCreate };
});

describe('countUsers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retourne le nombre d\'utilisateurs lorsque l\'API répond correctement', async () => {
        (api.get as jest.Mock).mockResolvedValue({
            data: [
                { id: 1, name: 'Jean Dupont' },
                { id: 2, name: 'Marie Martin' },
            ]
        });

        const result = await countUsers();

        expect(api.get).toHaveBeenCalledWith('/users');
        expect(result).toBe(2);
    });

    test('retourne 0 lorsque la liste est vide', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: [] });

        const result = await countUsers();

        expect(result).toBe(0);
    });

    test('lève une erreur lorsque l\'API échoue', async () => {
        (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

        await expect(countUsers()).rejects.toThrow('Network Error');
    });
});

describe('addUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('crée un utilisateur et retourne l\'objet avec l\'id', async () => {
        (api.post as jest.Mock).mockResolvedValue({
            data: { id: 11, nom: 'Dupont', prenom: 'Jean', mail: 'jean@test.com', birth: '2000-01-01', ville: 'Paris', cp: '75001' }
        });

        const userData = { nom: 'Dupont', prenom: 'Jean', mail: 'jean@test.com', birth: '2000-01-01', ville: 'Paris', cp: '75001' };
        const result = await addUser(userData);

        expect(api.post).toHaveBeenCalledWith('/users', userData);
        expect(result.id).toBe(11);
    });

    test('lève une erreur lorsque l\'API échoue à la création', async () => {
        (api.post as jest.Mock).mockRejectedValue(new Error('500 Internal Server Error'));

        const userData = { nom: 'Dupont', prenom: 'Jean', mail: 'jean@test.com', birth: '2000-01-01', ville: 'Paris', cp: '75001' };

        await expect(addUser(userData)).rejects.toThrow('500 Internal Server Error');
    });
});
