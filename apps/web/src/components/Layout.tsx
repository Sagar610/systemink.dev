import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Moon, Sun, Search, LogOut, Settings, LayoutDashboard, Bell, PenSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from './ui/use-toast';
import { Toaster } from './ui/toaster';
import { getInitials } from '@/lib/utils';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isDarkMode, toggleDarkMode } = useAuthStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore errors
    } finally {
      logout();
      window.location.href = '/';
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold text-foreground group-hover:opacity-90 transition-opacity">SystemInk</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4 flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-full"
                />
              </div>
            </form>
            <div className="flex items-center space-x-4">
              <Link
                to="/tags"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname.startsWith('/tags') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Tags
              </Link>
              <Link
                to="/authors"
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname.startsWith('/authors') ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                Authors
              </Link>
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                <Link to="/editor/new">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PenSquare className="h-4 w-4" />
                    <span>Write</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  {/* Optional: notification badge can be added here */}
                </Button>
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon" aria-label="Dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                  </Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin/users">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to={`/author/${user.username}`}>
                  <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs font-medium">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link to="/settings/profile">
                  <Button variant="ghost" size="icon" aria-label="Settings">
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t py-8 mt-auto flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2024 SystemInk. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/tags" className="text-sm text-muted-foreground hover:text-foreground">
                Tags
              </Link>
              <Link to="/authors" className="text-sm text-muted-foreground hover:text-foreground">
                Authors
              </Link>
              <a href="/api/rss.xml" className="text-sm text-muted-foreground hover:text-foreground">
                RSS
              </a>
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
