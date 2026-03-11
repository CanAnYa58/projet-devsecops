# ECS Task Definitions and Services

# Market Service Task Definition
resource "aws_ecs_task_definition" "market_service" {
  family                   = "${var.app_name}-market-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "market-service"
      image     = "${aws_ecr_repository.market_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3002
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "3002"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}/market-service"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-market-service"
    Environment = var.environment
  }
}

# Market Service
resource "aws_ecs_service" "market_service" {
  name            = "${var.app_name}-market-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.market_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.market_service.arn
  }

  tags = {
    Name        = "${var.app_name}-market-service"
    Environment = var.environment
  }
}

# Portfolio Service Task Definition
resource "aws_ecs_task_definition" "portfolio_service" {
  family                   = "${var.app_name}-portfolio-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "portfolio-service"
      image     = "${aws_ecr_repository.portfolio_service.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3003
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "3003"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DB_HOST"
          value = aws_db_instance.postgres.address
        },
        {
          name  = "DB_PORT"
          value = "5432"
        },
        {
          name  = "DB_USERNAME"
          value = "postgres"
        },
        {
          name  = "DB_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DB_DATABASE"
          value = "stocktracker"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}/portfolio-service"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-portfolio-service"
    Environment = var.environment
  }
}

# Portfolio Service
resource "aws_ecs_service" "portfolio_service" {
  name            = "${var.app_name}-portfolio-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.portfolio_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.portfolio_service.arn
  }

  tags = {
    Name        = "${var.app_name}-portfolio-service"
    Environment = var.environment
  }
}

# API Gateway Task Definition
resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "${var.app_name}-api-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "api-gateway"
      image     = "${aws_ecr_repository.api_gateway.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "PORT"
          value = "3001"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "MARKET_SERVICE_URL"
          value = "http://market-service.${var.app_name}.local:3002"
        },
        {
          name  = "PORTFOLIO_SERVICE_URL"
          value = "http://portfolio-service.${var.app_name}.local:3003"
        },
        {
          name  = "FRONTEND_URL"
          value = "http://${aws_lb.main.dns_name}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}/api-gateway"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-api-gateway"
    Environment = var.environment
  }
}

# API Gateway Service
resource "aws_ecs_service" "api_gateway" {
  name            = "${var.app_name}-api-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_gateway.arn
    container_name   = "api-gateway"
    container_port   = 3001
  }

  depends_on = [
    aws_lb_listener.http,
    aws_ecs_service.market_service,
    aws_ecs_service.portfolio_service
  ]

  tags = {
    Name        = "${var.app_name}-api-gateway"
    Environment = var.environment
  }
}

# Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.app_name}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = "http://${aws_lb.main.dns_name}"
        },
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${var.app_name}/frontend"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-frontend"
    Environment = var.environment
  }
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "${var.app_name}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name        = "${var.app_name}-frontend"
    Environment = var.environment
  }
}

# Service Discovery Namespace
resource "aws_service_discovery_private_dns_namespace" "main" {
  name = "${var.app_name}.local"
  vpc  = aws_vpc.main.id

  tags = {
    Name        = "${var.app_name}-namespace"
    Environment = var.environment
  }
}

# Service Discovery for Market Service
resource "aws_service_discovery_service" "market_service" {
  name = "market-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name        = "${var.app_name}-market-service-discovery"
    Environment = var.environment
  }
}

# Service Discovery for Portfolio Service
resource "aws_service_discovery_service" "portfolio_service" {
  name = "portfolio-service"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name        = "${var.app_name}-portfolio-service-discovery"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/ecs/${var.app_name}/api-gateway"
  retention_in_days = 7

  tags = {
    Name        = "${var.app_name}-api-gateway-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "market_service" {
  name              = "/ecs/${var.app_name}/market-service"
  retention_in_days = 7

  tags = {
    Name        = "${var.app_name}-market-service-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "portfolio_service" {
  name              = "/ecs/${var.app_name}/portfolio-service"
  retention_in_days = 7

  tags = {
    Name        = "${var.app_name}-portfolio-service-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.app_name}/frontend"
  retention_in_days = 7

  tags = {
    Name        = "${var.app_name}-frontend-logs"
    Environment = var.environment
  }
}
