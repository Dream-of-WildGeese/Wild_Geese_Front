import { client } from '../client';

// gender: MALE | FEMALE, birthDate: "1856-03-02" 형식.
export const updateHealthProfile = ({ name, birthDate, gender, diseases, wellnessInterests }) =>
  client.put('/api/v1/users/me/healthprofile', {
    name,
    birthDate,
    gender,
    diseases,
    wellnessInterests,
  });
