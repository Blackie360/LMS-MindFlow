import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
}

interface DashboardStats {
  totalUsers?: number;
  totalOrganizations?: number;
  completionRate?: number;
  averageRating?: number;
  enrolledCourses?: number;
  completedLessons?: number;
  progressPercentage?: number;
}

interface UseDashboardDataReturn {
  // State
  userOrganizations: Organization[];
  currentOrganization: Organization | null;
  dashboardStats: DashboardStats | null;
  courses: any[];
  students: any[];
  analytics: any;
  recentActivity: any[];
  upcomingTasks: any[];
  achievements: any[];

  // Loading states
  isLoadingOrg: boolean;
  isLoadingStats: boolean;
  isLoadingCourses: boolean;
  isLoadingStudents: boolean;
  isLoadingAnalytics: boolean;
  isLoadingActivity: boolean;
  isLoadingTasks: boolean;
  isLoadingAchievements: boolean;

  // Actions
  refreshData: () => Promise<void>;
  setCurrentOrganization: (org: Organization | null) => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const { data: session } = useSession();

  // State
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Loading states
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

  // Memoize session user ID to prevent unnecessary API calls
  const userId = useMemo(() => session?.user?.id, [session?.user?.id]);

  // Consolidated API calls function
  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    // Fetch organizations
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organization");
        if (response.ok) {
          const data = await response.json();
          const organizations = data.data;

          if (organizations && organizations.length > 0) {
            const mappedOrgs = organizations.map((org: any) => ({
              id: org.id,
              name: org.name,
              slug: org.slug,
              createdBy: org.createdBy,
            }));

            setUserOrganizations(mappedOrgs);
            setCurrentOrganization(mappedOrgs[0]);
          } else {
            setUserOrganizations([]);
            setCurrentOrganization(null);
          }
        } else {
          setUserOrganizations([]);
          setCurrentOrganization(null);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setUserOrganizations([]);
        setCurrentOrganization(null);
      } finally {
        setIsLoadingOrg(false);
      }
    };

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Fetch courses
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const response = await fetch("/api/dashboard/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    // Fetch students
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const response = await fetch("/api/dashboard/students");
        if (response.ok) {
          const data = await response.json();
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    // Fetch analytics
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const response = await fetch("/api/dashboard/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.data);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    // Fetch recent activity
    const fetchRecentActivity = async () => {
      try {
        setIsLoadingActivity(true);
        const response = await fetch("/api/dashboard/activity");
        if (response.ok) {
          const data = await response.json();
          setRecentActivity(data.data);
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setIsLoadingActivity(false);
      }
    };

    // Fetch upcoming tasks
    const fetchUpcomingTasks = async () => {
      try {
        setIsLoadingTasks(true);
        const response = await fetch("/api/dashboard/tasks");
        if (response.ok) {
          const data = await response.json();
          setUpcomingTasks(data.data);
        }
      } catch (error) {
        console.error("Error fetching upcoming tasks:", error);
      } finally {
        setIsLoadingTasks(false);
      }
    };

    // Fetch achievements
    const fetchAchievements = async () => {
      try {
        setIsLoadingAchievements(true);
        const response = await fetch("/api/dashboard/achievements");

        if (response.ok) {
          const data = await response.json();
          setAchievements(data.data || []);
        } else {
          setAchievements([]);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAchievements([]);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    // Execute all API calls in parallel
    await Promise.allSettled([
      fetchOrganizations(),
      fetchStats(),
      fetchCourses(),
      fetchStudents(),
      fetchAnalytics(),
      fetchRecentActivity(),
      fetchUpcomingTasks(),
      fetchAchievements()
    ]);
  }, [session?.user?.id]);

  // Single useEffect to fetch all dashboard data
  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id, fetchDashboardData]);

  // Refresh function
  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // State
    userOrganizations,
    currentOrganization,
    dashboardStats,
    courses,
    students,
    analytics,
    recentActivity,
    upcomingTasks,
    achievements,

    // Loading states
    isLoadingOrg,
    isLoadingStats,
    isLoadingCourses,
    isLoadingStudents,
    isLoadingAnalytics,
    isLoadingActivity,
    isLoadingTasks,
    isLoadingAchievements,

    // Actions
    refreshData,
    setCurrentOrganization,
  };
}

