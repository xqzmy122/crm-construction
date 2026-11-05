import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./auth/AuthProvider"
import { ExecutorRoute, ManagerRoute, ProtectedRoute } from "./auth/routes"
import { AppShell } from "./components/layout/AppShell"
import { LoginPage } from "./pages/LoginPage"
import { MyTasksPage } from "./pages/MyTasksPage"
import { ObjectDetailPage } from "./pages/ObjectDetailPage"
import { ObjectFormPage } from "./pages/ObjectFormPage"
import { ObjectsPage } from "./pages/ObjectsPage"
import { TaskDetailPage } from "./pages/TaskDetailPage"
import { TaskFormPage } from "./pages/TaskFormPage"

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/objects" element={<ObjectsPage />} />
          <Route path="/objects/:id" element={<ObjectDetailPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route
            path="/my-tasks"
            element={
              <ExecutorRoute>
                <MyTasksPage />
              </ExecutorRoute>
            }
          />
          <Route element={<ManagerRoute />}>
            <Route path="/objects/new" element={<ObjectFormPage />} />
            <Route path="/objects/:id/edit" element={<ObjectFormPage />} />
            <Route
              path="/objects/:id/tasks/new"
              element={<TaskFormPage />}
            />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/objects" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
