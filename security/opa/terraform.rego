package terraform.security

# Ensure ECR repositories enforce immutable tags.
deny[msg] {
  some name
  repo := input.resource.aws_ecr_repository[name]
  repo.image_tag_mutability != "IMMUTABLE"
  msg := sprintf("ECR repository %s must use IMMUTABLE tags", [name])
}

# Ensure ECS task definitions have dedicated task roles.
deny[msg] {
  some name
  td := input.resource.aws_ecs_task_definition[name]
  not td.task_role_arn
  msg := sprintf("ECS task definition %s must define task_role_arn", [name])
}

# Ensure RDS is not publicly accessible.
deny[msg] {
  some name
  db := input.resource.aws_db_instance[name]
  db.publicly_accessible == true
  msg := sprintf("RDS instance %s must not be publicly accessible", [name])
}
