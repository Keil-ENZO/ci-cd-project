provider "aws" {
  region = "eu-west-3" # Paris
}

# 1. AMI Ubuntu 24.04
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

# 2. Clé SSH générée à la volée (le bridge CI/CD récupère la clé privée)
resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name_prefix = "app-key-enzo-"
  public_key      = tls_private_key.pk.public_key_openssh
}

# Sauvegarde locale de la clé privée pour qu'Ansible s'en serve
resource "local_file" "ssh_key" {
  filename        = "${path.module}/app-key.pem"
  content         = tls_private_key.pk.private_key_pem
  file_permission = "0400"
}

# 3. Security Group : SSH + Frontend + Backend + Adminer
resource "aws_security_group" "app_sg" {
  name_prefix = "app-sg-enzo-"
  description = "Allow SSH, Frontend, Backend, Adminer"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend (React/Vite)"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend (FastAPI)"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Adminer"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Instance EC2 applicative
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.generated_key.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "Terraform-App-Server-Enzo"
  }
}

# 5. Outputs consommés par le bridge CI/CD pour générer l'inventory
output "instance_ip" {
  value = aws_instance.app_server.public_ip
}

output "ssh_private_key" {
  value     = tls_private_key.pk.private_key_pem
  sensitive = true
}
