variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

# DIRECT INPUTS (NO MODULE)
variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "ecr_image" {
  type = string
}


variable "cpu" {
  type    = number
  default = 1024
}

variable "memory" {
  type    = number
  default = 2048
}
