import { GlobalPortal, GlobalStyles } from 'tosslib';
import { NuqsAdapter } from 'nuqs/adapters/react-router';
import { Routes } from './pages/Routes';

export function App() {
  return (
    <>
      <GlobalStyles />
      <GlobalPortal.Provider>
        <NuqsAdapter>
          <Routes />
        </NuqsAdapter>
      </GlobalPortal.Provider>
    </>
  );
}
