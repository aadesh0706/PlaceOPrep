#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;  // value → index

    for (int i = 0; i < nums.size(); i++) {
        int remaining = target - nums[i];

        if (mp.count(remaining)) {
            return { mp[remaining], i }; 
        }

        mp[nums[i]] = i;
    }

    return {};  // return empty vector if no answer
}


int main() {
    auto result = twoSum(vector<int>{3,2,4}, 6);
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]";
    return 0;
}
