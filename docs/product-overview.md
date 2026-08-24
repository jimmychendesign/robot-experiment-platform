# Product Overview

## Background

Robot experiment operations require coordination among requesters, experiment administrators, robots, and testers. The current prototype consolidates demand intake, resource visibility, scheduling, execution, and exception handling into one operational workspace.

## Problem Statement

Experiment requests, Robot capacity, Tester availability, and execution status can become disconnected when managed in separate tools or manually. This creates scheduling conflicts, unclear ownership, and delayed status feedback.

## Goals

- Provide one shared view of experiment demand and operational capacity.
- Make Robot and Tester constraints visible during scheduling.
- Support role-specific workflows for requesters, administrators, and testers.
- Provide observable feedback for conflicts, rescheduling, leave, breaks, and execution changes.

## Non-goals

- Direct control of physical robots.
- Production-grade identity, authorization, notifications, or audit storage.
- Durable scheduling persistence in the current prototype.

## Target Users

- Experiment requester
- Experiment administrator
- Tester

## Core Value Proposition

Turn experiment demand into an understandable, coordinated, and traceable operating schedule while keeping resource constraints visible to every role.

## Success Metrics

- TBD: request-to-schedule time.
- TBD: scheduling conflict rate.
- TBD: experiment completion rate and throughput.
- TBD: reassignment time after Robot or Tester unavailability.

## High-level Scope

Request creation and tracking, Robot capacity, Tester assignment, schedule visualization, experiment execution, leave/break handling, conflict feedback, and role-based operational views.
