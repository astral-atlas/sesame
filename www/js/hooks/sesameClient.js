// @flow strict
/*:: import type { GuestSesameClient, UserSesameClient, AdminSesameClient } from '@astral-atlas/sesame-client'; */
import { useContext } from 'preact/hooks';
import { sesameClientContext } from '../context/sesameClient';

export const useGuestSesameClient = ()/*: GuestSesameClient*/ => {
  const clients = useContext(sesameClientContext);
  const guestClient = clients.guest;
  if (!guestClient)
    throw new Error();
  return guestClient;
};

export const useUserSesameClient = ()/*: UserSesameClient*/ => {
  const clients = useContext(sesameClientContext);
  const userClient = clients.user;
  if (!userClient)
    throw new Error();
  return userClient;
};

export const useAdminSesameClient = ()/*: AdminSesameClient*/ => {
  const clients = useContext(sesameClientContext);
  const adminClient = clients.admin;
  if (!adminClient)
    throw new Error();
  return adminClient;
};

