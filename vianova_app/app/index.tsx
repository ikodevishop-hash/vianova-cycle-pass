import React from 'react';
import { Redirect } from 'expo-router';
import { getSession } from '../src/store';

export default function Index() {
  // Store is already hydrated in the root layout before this renders.
  return <Redirect href={getSession() ? '/home' : '/login'} />;
}
