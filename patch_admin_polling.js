import fs from 'fs';

let content = fs.readFileSync('src/components/Admin/AdminDashboard.tsx', 'utf8');

// Replace the useEffect block with one that has a setInterval
const oldEffect = /  useEffect\(\(\) => \{\n    async function loadAdminData[\s\S]*?loadAdminData\(\);\n  \}, \[getToken\]\);/;

const newEffect = `  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    async function loadAdminData(isInitial = false) {
      try {
        const token = await getToken();
        if (!token) return;

        const [usersRes, statsRes] = await Promise.all([
          fetch('/api/users/all', { headers: { Authorization: \`Bearer \${token}\` } }),
          fetch('/api/farms/admin/stats', { headers: { Authorization: \`Bearer \${token}\` } })
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.logins || []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        if (isInitial) setLoading(false);
      }
    }
    
    loadAdminData(true);
    
    // Poll every 3 seconds for real-time updates
    intervalId = setInterval(() => {
      loadAdminData(false);
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [getToken]);`;

content = content.replace(oldEffect, newEffect);

// Update how recent searches render because we changed the shape
const oldSearchRender = /\{stats\?\.recentSearches\?\.map\(\(s: any, idx: number\) => \([\s\S]*?\{s\.fullName \|\| s\.email \|\| 'User'\} searched for data\n                      <\/p>\n                      <p className="text-xs text-gray-500 mt-1">Context: \{s\.query\}<\/p>[\s\S]*?Recent\n                    <\/div>\n                  <\/div>\n                \)\)\}/;

const newSearchRender = `{stats?.recentSearches?.map((s: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-xl bg-gray-50">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {s.email} triggered {s.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{s.details}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}`;

content = content.replace(oldSearchRender, newSearchRender);

fs.writeFileSync('src/components/Admin/AdminDashboard.tsx', content);

