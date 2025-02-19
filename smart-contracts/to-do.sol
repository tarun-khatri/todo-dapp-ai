// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskManager {
    // Mapping from user address to an array of completed task hashes.
    mapping(address => bytes32[]) private completedTasks;
    // Nested mapping to quickly check if a task hash has already been recorded.
    mapping(address => mapping(bytes32 => bool)) private taskExists;
    
    // Event emitted when a task is marked as complete.
    event TaskCompleted(address indexed user, bytes32 taskHash, uint256 timestamp);

  
    function completeTask(bytes32 taskHash) external {
        require(taskHash != 0, "Task hash cannot be zero");
        require(!taskExists[msg.sender][taskHash], "Task already marked completed");

        // Mark the task as completed.
        taskExists[msg.sender][taskHash] = true;
        completedTasks[msg.sender].push(taskHash);

        emit TaskCompleted(msg.sender, taskHash, block.timestamp);
    }

 
    function getCompletedTasks(address user) external view returns (bytes32[] memory) {
        return completedTasks[user];
    }


    function isTaskCompleted(address user, bytes32 taskHash) external view returns (bool) {
        return taskExists[user][taskHash];
    }
}
