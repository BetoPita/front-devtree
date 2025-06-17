import { isAxiosError } from "axios";
import api from "../config/axios";

export async function getUser() {

  try {
    //interceptor en axios.ts agrega a las peticiones los headers del token
    const { data } = await api.get(`/user`, {
    });
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error);
    }
  }
}
