import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ReverseProxyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create Network ACL for public subnet (reverse proxy)
    const publicProxyNACL = new ec2.CfnNetworkAcl(this, 'PublicProxyNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'public-proxy-nacl' }]
    });

    // Inbound rules for public reverse proxy
    new ec2.CfnNetworkAclEntry(this, 'PublicInboundResponse', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttp', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicInboundHttps', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    // Outbound rules for public reverse proxy
    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundResponse', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttp', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 80,
        to: 80,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PublicOutboundHttps', {
      networkAclId: publicProxyNACL.ref,
      ruleNumber: 300,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 443,
        to: 443,
      },
    });

    // Associate the NACL to the public subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PublicProxyNACLAssociation', {
      subnetId: vpc.publicSubnets[0].subnetId,
      networkAclId: publicProxyNACL.ref,
    });

    // Create Network ACL for private subnet
    const privateServerNACL = new ec2.CfnNetworkAcl(this, 'PrivateServerNACL', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: 'private-server-nacl' }]
    });

    // Inbound rules for private server
    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundResponse', {
      networkAclId: privateServerNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    new ec2.CfnNetworkAclEntry(this, 'PrivateInboundHttp', {
      networkAclId: privateServerNACL.ref,
      ruleNumber: 200,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: false,
      cidrBlock: vpc.publicSubnets[0].ipv4CidrBlock,
      portRange: {
        from: 80,
        to: 80,
      },
    });

    // Outbound rules for private server
    new ec2.CfnNetworkAclEntry(this, 'PrivateOutboundResponse', {
      networkAclId: privateServerNACL.ref,
      ruleNumber: 100,
      protocol: 6, // TCP
      ruleAction: 'allow',
      egress: true,
      cidrBlock: '0.0.0.0/0',
      portRange: {
        from: 1024,
        to: 65535,
      },
    });

    // Associate the NACL to the private subnet
    new ec2.CfnSubnetNetworkAclAssociation(this, 'PrivateServerNACLAssociation', {
      subnetId: vpc.isolatedSubnets[0].subnetId,
      networkAclId: privateServerNACL.ref,
    });

    // Create IAM role for the reverse proxy instance with granular permissions
    const reverseProxyRole = new iam.Role(this, 'ReverseProxyRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Create custom policy for reverse proxy to describe instances
    const reverseProxyPolicy = new iam.Policy(this, 'ReverseProxyPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'ec2:DescribeInstances'
          ],
          resources: ['*']
        })
      ]
    });

    reverseProxyPolicy.attachToRole(reverseProxyRole);

    // Create IAM role for the private server instance (minimal permissions)
    const privateServerRole = new iam.Role(this, 'PrivateServerRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Create a security group for the reverse proxy
    const reverseProxySecurityGroup = new ec2.SecurityGroup(this, 'ReverseProxySecurityGroup', {
      allowAllOutbound: true,
      description: 'Security group for reverse proxy',
      securityGroupName: 'reverse-proxy-security-group',
      vpc: vpc,
    });

    // Allow HTTP and HTTPS traffic from anywhere
    reverseProxySecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere',
    );
    reverseProxySecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS traffic from anywhere',
    );

    // Create a security group for the private server
    const privateServerSecurityGroup = new ec2.SecurityGroup(this, 'PrivateServerSecurityGroup', {
      allowAllOutbound: true,
      description: 'Security group for private server',
      securityGroupName: 'private-server-security-group',
      vpc: vpc,
    });

    // Allow HTTP traffic from reverse proxy only
    privateServerSecurityGroup.addIngressRule(
      reverseProxySecurityGroup,
      ec2.Port.tcp(80),
      'Allow HTTP traffic from reverse proxy only',
    );

    // User data script for the private server
    const privateServerUserData = ec2.UserData.forLinux();
    privateServerUserData.addCommands(
      'mkdir /home/ec2-user/http-server',
      'cd /home/ec2-user/http-server',
      'cat > index.html << EOF',
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '    <meta charset="UTF-8">',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '    <title>AWS Simple Architecture Demo</title>',
      '    <style>body { font-family: Arial, sans-serif; text-align: center; font-size: 24px; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>',
      '</head>',
      '<body>',
      '    <h1>AWS Simple Architecture Demo</h1>',
      '</body>',
      '</html>',
      'EOF',
      'sudo python3 -m http.server 80'
    );

    // Create the private server instance
    const privateServerInstance = new ec2.Instance(this, 'PrivateServerInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceName: 'private-server-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      vpc: vpc,
      securityGroup: privateServerSecurityGroup,
      userData: privateServerUserData,
      role: privateServerRole,
    });

    // User data script for the reverse proxy with dynamic IP resolution
    const reverseProxyUserData = ec2.UserData.forLinux();
    reverseProxyUserData.addCommands(
      'sudo yum install -y socat',
      'PRIVATE_IP=""',
      'while [ -z "$PRIVATE_IP" ] || [ "$PRIVATE_IP" = "None" ]; do',
      '  sleep 10;',
      '  PRIVATE_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=private-server-instance" "Name=instance-state-name,Values=running" --query "Reservations[0].Instances[0].PrivateIpAddress" --output text);',
      'done',
      'sudo socat TCP-LISTEN:80,reuseaddr,fork,su=nobody TCP:$PRIVATE_IP:80 &',
    );

    // Create the reverse proxy instance
    const reverseProxyInstance = new ec2.Instance(this, 'ReverseProxyInstance', {
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceName: 'reverse-proxy-instance',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: reverseProxySecurityGroup,
      vpc: vpc,
      userData: reverseProxyUserData,
      role: reverseProxyRole,
    });

    // Output the private server's private IP
    new cdk.CfnOutput(this, 'PrivateServerPrivateIP', {
      value: privateServerInstance.instancePrivateIp,
      description: 'Private IP of the private server',
    });

    // Output the reverse proxy's public IP
    new cdk.CfnOutput(this, 'ReverseProxyPublicIP', {
      value: reverseProxyInstance.instancePublicIp,
      description: 'Public IP of the reverse proxy',
    });

    // Output the reverse proxy's private IP
    new cdk.CfnOutput(this, 'ReverseProxyPrivateIP', {
      value: reverseProxyInstance.instancePrivateIp,
      description: 'Private IP of the reverse proxy',
    });
  }
}
