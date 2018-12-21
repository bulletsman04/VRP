using System.Collections.Generic;

namespace VRP.Functionality
{
    public class NaiveMultipleTspSolver
    {
        private float[][] Graph { get; }
        private bool[] UsedPackages { get; set; }
        private int UsedPackagesCount { get; set; }
        public NaiveMultipleTspSolver(float[][] graph)
        {
            Graph = graph;
        }

        public List<List<int>> Solve(int[] couriers)
        {
            int n = Graph.GetLength(0);
            UsedPackages = new bool[n];
            UsedPackagesCount = 0;

            List<List<int>> routes = new List<List<int>>();
            foreach (int courier in couriers)
            {
                routes.Add(new List<int>());
                UsedPackages[courier] = true;
                UsedPackagesCount++;
            }

            while (UsedPackagesCount < n)
            {
                for(int i = 0; i < couriers.Length; i++)
                {
                    int package = FindMinimalInRow(couriers[i]);
                    if (package < 0) break;
                    routes[i].Add(package);
                    couriers[i] = package;
                    UsedPackages[package] = true;
                    UsedPackagesCount++;
                }
            }

            return routes;
        }

        private int FindMinimalInRow(int row)
        {
            float min = float.MaxValue;
            int minIndex = -1;
            for(int i = 0; i < Graph[0].GetLength(0); i++)
                if (i != row && !UsedPackages[i] && Graph[row][i] < min)
                {
                    min = Graph[row][i];
                    minIndex = i;
                }

            return minIndex;
        }
    }
}