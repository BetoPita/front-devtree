import { useForm } from "react-hook-form";
import ErrorMessage from "../components/ErrorMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileForm, User } from "../types";
import { updateProfile, uploadImage } from "../api/DevTreeApi";
import { toast } from "sonner";

export default function ProfileView() {
  // con react query obtener los datos del usuario logueado
  const queryClient = useQueryClient();
  const data: User = queryClient.getQueryData(["user"])!; // "!" es que garantiza que si existe
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      handle: data.handle,
      description: data.description,
    },
  });

  //Mutaciones
  const updateProfileMutation = useMutation({
    // funcion que se va ejecutar
    mutationFn: updateProfile,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      // eliminar los datos cacheados y actualizar sin recargar
      // lo que hace es elimina lo que hay en la key que le mandas y vuelve a consultar la bd para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(data);
    },
  });

  const uploadImageMutation = useMutation({
    // funcion que se va ejecutar
    mutationFn: uploadImage,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (data) => {
      //querys optimistas, adelantas a lo que va pasar
      queryClient.setQueryData(['user'], (prevData : User) => {
        return {
          ...prevData,
          image: data
        }
      })
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadImageMutation.mutate(e.target.files[0]);
    }
  };

  const handleUserProfileForm = (formData: ProfileForm) => {
    console.log("handleUserProfileForm");
    updateProfileMutation.mutate(formData);
  };
  return (
    <form
      className="bg-white p-10 rounded-lg space-y-5"
      onSubmit={handleSubmit(handleUserProfileForm)}
    >
      <legend className="text-2xl text-slate-800 text-center">
        Editar Información
      </legend>
      <div className="grid grid-cols-1 gap-2">
        <label htmlFor="handle">Handle:</label>
        <input
          type="text"
          className="border-none bg-slate-100 rounded-lg p-2"
          placeholder="handle o Nombre de Usuario"
          {...register("handle", {
            required: "El nombre del usuario es obligatorio",
          })}
        />
        {errors.handle && <ErrorMessage>{errors.handle.message}</ErrorMessage>}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <label htmlFor="description">Descripción:</label>
        <textarea
          className="border-none bg-slate-100 rounded-lg p-2"
          placeholder="Tu Descripción"
          {...register("description", {
            required: "La descripción es obligatoria",
          })}
        />
        {errors.description && (
          <ErrorMessage>{errors.description.message}</ErrorMessage>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <label htmlFor="handle">Imagen:</label>
        <input
          id="image"
          type="file"
          name="handle"
          className="border-none bg-slate-100 rounded-lg p-2"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      <input
        type="submit"
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
        value="Guardar Cambios"
      />
    </form>
  );
}
